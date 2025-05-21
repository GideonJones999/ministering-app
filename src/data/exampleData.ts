export type Minister = {
  id: string;
  name: string;
};

export type Member = {
  id: string;
  name: string;
};

export type Companionship = {
  id: string;
  ministers: Minister[];
  members?: Member[];
};

export const ministers: Minister[] = [
  { id: "min-m1", name: "John" },
  { id: "min-m2", name: "Paul" },
  { id: "min-m3", name: "George" },
  { id: "min-m4", name: "Gideon" },
  { id: "min-w1", name: "Mary" },
  { id: "min-w2", name: "Sarah" },
  { id: "min-w3", name: "Sailor" },
  { id: "min-w4", name: "Eden" },
];

export const members: Member[] = [
  { id: "mem-f1", name: "The Smith Family" },
  { id: "mem-w3", name: "Anna" },
  { id: "mem-f2", name: "The Johnson Family" },
  { id: "mem-w4", name: "Rachel" },
];
