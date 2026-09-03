export type WorkType = 'poster' | 'oral';

export type Tematica = 'SMA' | 'ECO' | 'ENS' | 'EMA';

export const TEMATICAS: Record<Tematica, string> = {
  'SMA': 'Saúde e Meio Ambiente - SMA',
  'ECO': 'Ecologia e Conservação - ECO',
  'ENS': 'Engenharias e Sustentabilidade - ENS',
  'EMA': 'Energia e Materiais - EMA'
};

export interface Poster {
  id: string;
  posterId: string;
  title: string;
  presenterName: string;
  type: WorkType;
  abstract?: string;
  presentationTime?: string;
  presentationDate?: string;
  tematica?: Tematica;
  /** Attendance status. The legacy values remain supported for existing rows. */
  evaluationStatus?: 'presented' | 'absent' | 'evaluated' | 'not-evaluated';
}

export interface Criterion {
  id: string;
  label: string;
}

export interface Evaluation {
  posterId: string;
  scores: Record<string, number>;
  generalComments: string;
  evaluatorId: string;
  timestamp: string;
}

export type ViewState = 'login' | 'dashboard' | 'evaluation' | 'admin';

export interface Evaluator {
  id: string;
  name: string;
  accessCode: string;
  areas?: Tematica[];
}
