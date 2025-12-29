import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'products' | 'orders' | 'order_items' | 'users' | 'chat_messages';

interface RealtimeOptions {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: { column: string; value: string };
  onChange: (payload: any) => void;
}

// Cache para canales activos
const activeChannels = new Map<string, RealtimeChannel>();

/**
 * Hook para suscribirse a cambios en tiempo real en una tabla
 */
export function useRealtimeSubscription(options: RealtimeOptions) {
  const { table, event = '*', filter, onChange } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);

  const channelKey = `${table}-${event}-${filter?.column || 'all'}-${filter?.value || 'all'}`;

  useEffect(() => {
    // Verificar si ya existe un canal para esta combinación
    if (activeChannels.has(channelKey)) {
      channelRef.current = activeChannels.get(channelKey)!;
      return;
    }

    // Construir filtro de canal
    let channelFilter = '';
    if (filter) {
      channelFilter = `${filter.column}=eq.${filter.value}`;
    }

    // Crear nuevo canal
    const channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
          filter: filter ? channelFilter : undefined,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          onChange(payload);
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Canal ${channelKey} estado:`, status);
      });

    channelRef.current = channel;
    activeChannels.set(channelKey, channel);

    // Cleanup al desmontar
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        activeChannels.delete(channelKey);
        channelRef.current = null;
      }
    };
  }, [table, event, filter?.column, filter?.value, channelKey, onChange]);

  // Función para obtener el canal actual
  const getChannel = useCallback(() => {
    return channelRef.current;
  }, []);

  // Función para actualizar el handler
  const updateHandler = useCallback((newOnChange: (payload: any) => void) => {
    if (channelRef.current) {
      // Recrear el canal con el nuevo handler
      const oldChannel = channelRef.current;
      supabase.removeChannel(oldChannel);
      activeChannels.delete(channelKey);

      const newChannel = supabase
        .channel(channelKey)
        .on(
          'postgres_changes' as any,
          {
            event,
            schema: 'public',
            table,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            newOnChange(payload);
          }
        )
        .subscribe();

      channelRef.current = newChannel;
      activeChannels.set(channelKey, newChannel);
    }
  }, [table, event, channelKey]);

  return { getChannel, updateHandler };
}

/**
 * Hook específico para escuchar cambios en productos (stock en tiempo real)
 */
export function useProductRealtime(onProductChange: (payload: any) => void) {
  return useRealtimeSubscription({
    table: 'products',
    event: '*',
    onChange: onProductChange,
  });
}

/**
 * Hook específico para escuchar nuevos pedidos
 */
export function useOrdersRealtime(onOrderChange: (payload: any) => void) {
  return useRealtimeSubscription({
    table: 'orders',
    event: '*',
    onChange: onOrderChange,
  });
}

/**
 * Hook específico para escuchar mensajes de chat
 */
export function useChatRealtime(conversationId: string, onMessage: (payload: any) => void) {
  return useRealtimeSubscription({
    table: 'chat_messages',
    event: 'INSERT',
    filter: { column: 'conversation_id', value: conversationId },
    onChange: onMessage,
  });
}

/**
 * Utilidad para suscribirse a múltiples tablas simultáneamente
 */
export function useMultiRealtime(
  subscriptions: Array<{ table: TableName; event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE'; onChange: (payload: any) => void }>
) {
  useEffect(() => {
    const channels: RealtimeChannel[] = [];

    subscriptions.forEach((sub, index) => {
      const channel = supabase
        .channel(`multi-${index}-${sub.table}`)
        .on(
          'postgres_changes' as any,
          {
            event: sub.event || '*',
            schema: 'public',
            table: sub.table,
          },
          (payload) => {
            sub.onChange(payload);
          }
        )
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [subscriptions]);
}

/**
 * Utilidad para publishar eventos manualmente
 */
export async function publishRealtimeEvent(
  table: TableName,
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: Record<string, unknown>
) {
  // Usamos Supabase para broadcast pero también podríamos usar un endpoint del backend
  // Este método es más para comunicación entre clientes
  const channel = supabase.channel('broadcast-event');
  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'realtime_event',
    payload: { table, event, data: payload },
  });
  await supabase.removeChannel(channel);
}
