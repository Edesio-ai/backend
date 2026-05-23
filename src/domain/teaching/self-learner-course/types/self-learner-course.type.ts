import { Language } from '../../session/types/session.type';

export type SelfLearnerCourse = {
  id: string;
  selfLearnerId: string;
  title: string;
  description?: string | null;
  textContent?: string | null;
  language: Language;
  createdAt: string;
};

export type SelfLearnerCourseSupabase = {
  id: string;
  self_learner_id: string;
  title: string;
  description?: string | null;
  text_content?: string | null;
  language: Language;
  created_at: string;
};

export type SelfLearnerCourseInsertPayload = Omit<
  SelfLearnerCourse,
  'id' | 'createdAt'
>;
export type SelfLearnerCourseInsertSupabase = Omit<
  SelfLearnerCourseSupabase,
  'id' | 'created_at'
>;

export type UpdateSelfLearnerCoursePayload = Omit<
  Partial<SelfLearnerCourse>,
  'id' | 'createdAt' | 'selfLearnerId'
>;

export type SelfLearnerCourseUpdateSupabase = Omit<
  Partial<SelfLearnerCourseSupabase>,
  'id' | 'created_at' | 'self_learner_id'
>;
