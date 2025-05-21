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
  { id: "m1", name: "John", gender: "male" },
  { id: "m2", name: "Paul", gender: "male" },
  { id: "m3", name: "George", gender: "male" },
  { id: "m4", name: "Gideon", gender: "male" },
  { id: "w1", name: "Mary", gender: "female" },
  { id: "w2", name: "Sarah", gender: "female" },
  { id: "w3", name: "Sailor", gender: "female" },
  { id: "w4", name: "Eden", gender: "female" },
];

export const members: Member[] = [
  { id: "f1", name: "The Smith Family", isFamily: true },
  { id: "w3", name: "Anna", isFamily: false },
  { id: "f2", name: "The Johnson Family", isFamily: true },
  { id: "w4", name: "Rachel", isFamily: false },
];
