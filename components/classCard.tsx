import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getProfessorById, getSubjectById, formatDateTimeISO } from '../app/data';
import type { ClassSession } from '../app/data';

export function ClassCard({ session }: { session: ClassSession }) {
  const subject = getSubjectById(session.subjectId);
  const prof = getProfessorById(session.professorId);

  return (
    <View style={cardStyles.card}>
      <Image source={subject?.icon} style={cardStyles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={cardStyles.title}>{subject?.name ?? 'Materia'}</Text>
        <Text style={cardStyles.subtitle}>
          {prof ? `${prof.firstName} ${prof.lastName}` : 'Profesor'}
        </Text>
        <View style={cardStyles.row}>
          <Text style={chipStyles.chip}>
            {session.modality === 'virtual' ? 'Virtual' : 'Presencial'}
          </Text>
          <Text style={cardStyles.date}>{formatDateTimeISO(session.dateTime)}</Text>
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  icon: { width: 52, height: 52, borderRadius: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 2, color: '#6b7280' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 },
  date: { color: '#374151', fontSize: 12 },
});

const chipStyles = StyleSheet.create({
  chip: {
    fontSize: 12,
    backgroundColor: '#eef2ff',
    color: '#3730a3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
});