export type CorpusTier = 'canonical' | 'apocrypha' | 'pseudepigrapha' | 'academic' | 'private';
export type Era = 'Tanna' | 'Amora' | 'Gaon' | 'Rishon' | 'Acharon' | 'Modern' | 'Second Temple';
export type Community = 'Ashkenazi' | 'Sephardi' | 'Chabad' | 'Yemenite' | 'Ethiopian' | 'General' | 'Qumran';
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
