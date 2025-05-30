export type Minister = {
  id: string;
  name: string;
};

export type Member = {
  id: string;
  name: string;
  priority?: boolean;
};

export type Companionship = {
  id: string;
  ministers: Minister[];
  members?: Member[];
  district?: string;
};

export const ministers: Minister[] = [];

export const members: Member[] = [];
