export const mockComments = [
  {
    id: 1,
    songId: 10,
    content: "Bài hát quá hay!",
    parentId: null,
    children: [
      {
        id: 2,
        songId: 10,
        content: "Đồng ý luôn!",
        parentId: 1,
        children: [],
      },
    ],
  },
  {
    id: 3,
    songId: 10,
    content: "Beat chất thực sự",
    parentId: null,
    children: [],
  },
];
