export type CorpusTier = 'canonical' | 'apocrypha' | 'pseudepigrapha' | 'academic' | 'private';
export type Era = 'Tanna' | 'Amora' | 'Gaon' | 'Rishon' | 'Acharon' | 'Modern' | 'Second Temple';
export type Community =
  | 'General'
  // Ashkenazi
  | 'Ashkenazi' | 'Lithuanian' | 'German' | 'Polish' | 'Hungarian'
  // Chassidic
  | 'Chassidic' | 'Chabad' | 'Breslov' | 'Satmar' | 'Belz' | 'Ger' | 'Vizhnitz'
  // Sephardi
  | 'Sephardi' | 'Syrian' | 'Moroccan' | 'Iraqi' | 'Persian' | 'Turkish' | 'Tunisian' | 'Algerian'
  // Mizrachi
  | 'Mizrachi' | 'Yemenite' | 'Bukharan' | 'Indian' | 'Kurdish'
  // Land-of-Israel
  | 'Jerusalem' | 'Old Yishuv'
  // Other
  | 'Ethiopian' | 'Italian' | 'Romaniote'
  // Historical
  | 'Qumran' | 'Karaite';
export type MinhagScope = 'global' | 'regional' | 'local' | 'family' | 'chassidic';
export type Language = 'he' | 'en' | 'arc';
export type UserRole = 'learner' | 'advanced' | 'posek' | 'researcher';
export type SearchMode = 'practical' | 'deep_research' | 'posek_view';
export type ReviewStatus = 'unreviewed' | 'approved' | 'corrected' | 'rejected';
export type RelationType = 'argues_with' | 'supports' | 'quotes' | 'based_on' | 'minhag_override' | 'supersedes' | 'contextualizes';

export interface Corpus {
  id: number;
  name: string;
  corpus_tier: CorpusTier;
  source_url: string | null;
  license: string | null;
  ingested_at: Date;
}

export interface HalachaChunk {
  id: number;
  corpus_id: number;
  work: string;
  section_ref: string;
  parent_ref: string | null;
  language: Language;
  text: string;
  author: string | null;
  era: Era | null;
  community: Community;
  minhag_scope: MinhagScope;
  authority_weight: number;
  corpus_tier: CorpusTier;
  tags: string[];
  topics: string[];
  embedding: number[] | null;
  created_at: Date;
}

export interface HalachaRelation {
  id: number;
  from_chunk_id: number;
  to_chunk_id: number;
  relation_type: RelationType;
  direction: 'directed' | 'bidirectional';
  confidence: number;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
}

export interface UserProfile {
  id: number;
  display_name: string | null;
  primary_community: Community;
  secondary_customs: string[];
  preferred_poskim: string[];
  corpus_tiers: CorpusTier[];
  language_pref: string;
  role: UserRole;
  created_at: Date;
}

export interface HalachaAnswer {
  id: number;
  question: string;
  question_embedding: number[] | null;
  answer: string;
  cited_chunk_ids: number[];
  user_id: number | null;
  user_community: string | null;
  corpus_tiers_used: string[] | null;
  mode: SearchMode | null;
  reviewed_by: string | null;
  review_status: ReviewStatus;
  review_notes: string | null;
  correction: string | null;
  created_at: Date;
}

export interface InsertCorpus {
  name: string;
  corpus_tier: CorpusTier;
  source_url?: string;
  license?: string;
}

export interface InsertChunk {
  corpus_id: number;
  work: string;
  section_ref: string;
  parent_ref?: string | null;
  language: Language;
  text: string;
  author?: string | null;
  era?: Era | null;
  community?: Community;
  minhag_scope?: MinhagScope;
  authority_weight?: number;
  corpus_tier: CorpusTier;
  tags?: string[];
  topics?: string[];
}

export interface InsertAnswer {
  question: string;
  question_embedding?: number[];
  answer: string;
  cited_chunk_ids?: number[];
  user_id?: number;
  user_community?: string;
  corpus_tiers_used?: string[];
  mode?: SearchMode;
}

// --- Feature sprint tables ---

export interface TextLink {
  id: number;
  source_ref: string;
  target_ref: string;
  link_type: string;
  source_work: string | null;
  target_work: string | null;
  created_at: Date;
}

export interface InsertTextLink {
  source_ref: string;
  target_ref: string;
  link_type?: string;
  source_work?: string;
  target_work?: string;
}

export interface DictionaryEntry {
  id: number;
  word: string;
  word_normalized: string;
  language: string;
  definition: string;
  root: string | null;
  part_of_speech: string | null;
  source: string;
  created_at: Date;
}

export interface InsertDictionaryEntry {
  word: string;
  word_normalized: string;
  language?: string;
  definition: string;
  root?: string;
  part_of_speech?: string;
  source?: string;
}

export interface Topic {
  id: number;
  name: string;
  name_he: string | null;
  description: string | null;
  embedding: number[] | null;
  created_at: Date;
}

export interface TopicLink {
  id: number;
  topic_id: number;
  chunk_id: number;
  relevance: number;
}

export interface Bookmark {
  id: number;
  user_id: number;
  chunk_id: number;
  label: string | null;
  color: string;
  created_at: Date;
}

export interface Annotation {
  id: number;
  user_id: number;
  chunk_id: number;
  annotation_type: string;
  content: string | null;
  highlight_start: number | null;
  highlight_end: number | null;
  color: string;
  tags: string[];
  created_at: Date;
}

export interface ReadingHistoryEntry {
  id: number;
  user_id: number;
  work: string;
  section_ref: string;
  time_spent_seconds: number;
  last_read_at: Date;
}

export interface StudyProgress {
  id: number;
  user_id: number;
  work: string;
  total_sections: number;
  completed_sections: number;
  last_section_ref: string | null;
  updated_at: Date;
}

export interface StudySheet {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  share_slug: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface StudySheetItem {
  id: number;
  sheet_id: number;
  chunk_id: number | null;
  note: string | null;
  sort_order: number;
  created_at: Date;
}

export interface ResearchSession {
  id: number;
  user_id: number;
  title: string | null;
  context_work: string | null;
  context_section: string | null;
  messages: unknown[];
  created_at: Date;
  updated_at: Date;
}

export interface Rabbi {
  id: number;
  name_en: string;
  name_he: string | null;
  era: string | null;
  generation: string | null;
  community: string;
  birth_year: string | null;
  death_year: string | null;
  location: string | null;
  bio: string | null;
  created_at: Date;
}

export interface RabbiWork {
  id: number;
  rabbi_id: number;
  work_name: string;
}
