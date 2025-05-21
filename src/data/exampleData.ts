export type Minister = {
  id: string;
  name: string;
  gender: "male" | "female";
};

export type Member = {
  id: string;
  name: string;
  isFamily: boolean;
};

export type Companionship = {
  id: string;
  ministers: Minister[];
  members?: Member[];
};

export const ministers: Minister[] = [
  { id: "min-m1", name: "John", gender: "male" },
  { id: "min-m2", name: "Paul", gender: "male" },
  { id: "min-m3", name: "George", gender: "male" },
  { id: "min-m4", name: "Gideon", gender: "male" },
  { id: "min-w1", name: "Mary", gender: "female" },
  { id: "min-w2", name: "Sarah", gender: "female" },
  { id: "min-w3", name: "Sailor", gender: "female" },
  { id: "min-w4", name: "Eden", gender: "female" },
];

export const members: Member[] = [
  { id: "mem-f1", name: "The Smith Family", isFamily: true },
  { id: "mem-w3", name: "Anna", isFamily: false },
  { id: "mem-f2", name: "The Johnson Family", isFamily: true },
  { id: "mem-w4", name: "Rachel", isFamily: false },
];
