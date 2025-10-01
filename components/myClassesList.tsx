import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getClassesByStudentId } from '../app/data';
import type { ID, ClassSession } from '../app/data';
import { ClassCard } from './classCard';

export function MyClassesList({ userId }: { userId: ID }) {
  const sessions = useMemo<ClassSession[]>(() => getClassesByStudentId(userId), [userId]);

  if (!sessions.length) {
    return (
      <View style={listStyles.emptyWrap}>
        <Text style={listStyles.emptyTitle}>¡No tenés clases!</Text>
        <Text style={listStyles.emptyText}>Reservá una clase y va a aparecer acá ✨</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => <ClassCard session={item} />}
      contentContainerStyle={listStyles.container}
      scrollEnabled={false}
    />
  );
}

const listStyles = StyleSheet.create({
  container: { 
    paddingVertical: 8 , 
    backgroundColor: "#092a54ff",
    borderRadius: 20,
    padding: 20,
    paddingTop: 25,
    paddingBottom: 25},
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyTitle: { fontWeight: '700', fontSize: 16, color: '#111827' },
  emptyText: { color: '#6b7280' },
});