import { TopicData } from '../types';
import { TOPICS_PART1 } from './topics_part1';
import { TOPICS_PART2 } from './topics_part2';
import { TOPICS_PART3 } from './topics_part3';
import { TOPICS_PART4 } from './topics_part4';
import { TOPICS_PART5 } from './topics_part5';
import { TOPICS_PART6 } from './topics_part6';
import { TOPICS_PART7 } from './topics_part7';

export const ALL_TOPICS: TopicData[] = [
  ...TOPICS_PART1,
  ...TOPICS_PART2,
  ...TOPICS_PART3,
  ...TOPICS_PART4,
  ...TOPICS_PART5,
  ...TOPICS_PART6,
  ...TOPICS_PART7,
];

export function getTopicById(id: number): TopicData | undefined {
  return ALL_TOPICS.find((t) => t.id === id);
}

export function getTopicsBySection(sectionId: number): TopicData[] {
  return ALL_TOPICS.filter((t) => t.sectionId === sectionId);
}

export function searchTopics(query: string): TopicData[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_TOPICS;
  return ALL_TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.keyTerms.some((term) => term.toLowerCase().includes(q))
  );
}
