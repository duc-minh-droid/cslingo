/* js/bank/ds-55.js: Data Science lecture 14 revision questions, part 1: ds14-orders, ds14-shapes and ds14-sparse. */
(function () {
  const B = NIC.bank;
  const { mc } = NIC.shared.ds14;

  B.add("ds14-orders", [
    {
      type: "match",
      q: "Match each order to its name.",
      pairs: [
        ["0-order", "Scalar"],
        ["1-order", "Vector"],
        ["2-order", "Matrix"],
        ["3-order", "Tensor (a pile of matrices)"],
      ],
      why: "The slides list them in order: scalar, vector, matrix, then a 3-order tensor.",
    },
    mc(
      "What does the order of a tensor tell you?",
      ["How many indices pick out one value", "How many non-zero values it holds", "How large its biggest value is"],
      "Order counts directions: a vector needs one index, a matrix two, a 3-order tensor three.",
    ),
    mc(
      "A café's thermometer reads 21 degrees. As a tensor, what is that reading?",
      ["A scalar", "A vector", "A matrix"],
      "A single number on its own is a scalar, a 0-order tensor.",
    ),
    mc(
      "A shopper's basket is recorded as the quantity of each of 10 products. What kind of tensor is it?",
      ["A vector", "A scalar", "A matrix"],
      "One list of numbers, found with a single index (which product), is a vector.",
    ),
    mc(
      "You stack 12 monthly spreadsheets, each of shops × products. What order is the result?",
      ["3-order", "2-order", "1-order"],
      "Each spreadsheet is a matrix (2-order); stacking them adds a third direction, the month.",
    ),
    {
      type: "cat",
      q: "Sort each record by its kind of tensor.",
      buckets: ["Scalar", "Vector", "Matrix"],
      items: [
        ["Today's rainfall in millimetres", 0],
        ["The number of members right now", 0],
        ["One student's marks in five modules", 1],
        ["A runner's lap times in one race", 1],
        ["A class's marks: students × modules", 2],
        ["Distances between every pair of five towns", 2],
      ],
      why: "A single number is a scalar, a single list is a vector, and a grid of rows and columns is a matrix.",
    },
    mc(
      "Why do data scientists talk about tensors at all?",
      [
        "Data is frequently represented as tensors",
        "Tensors can only hold whole numbers",
        "Tensors avoid having to store any zeros",
      ],
      "Numbers, lists, tables, images and videos are all tensors of some order, so one idea covers most data.",
    ),
  ]);

  B.add("ds14-shapes", [
    {
      type: "match",
      q: "Match each kind of data to its shape.",
      pairs: [
        ["Vector data", "features"],
        ["Time series", "features × timestamps"],
        ["Image", "width × height × channels"],
        ["Video", "frames × width × height × channels"],
      ],
      why: "These are the four shapes on the slides; each new kind of data adds a direction.",
    },
    mc(
      "In an RGB image, what are the channels?",
      ["The red, green and blue grids", "The rows of pixels from top to bottom", "The frames played one after another"],
      "Each pixel mixes three colours, so the image holds one grid per colour channel.",
    ),
    mc(
      "A weather station records temperature and wind every 10 minutes. Which shape is that?",
      ["features × timestamps", "width × height × channels", "frames × width × height × channels"],
      "The same features measured over and over is a time series: features × timestamps.",
    ),
    mc(
      "What does a video add to the shape of a single image?",
      ["A frames direction", "A fourth colour channel", "A features direction"],
      "A video is a sequence of images, so its shape is frames × width × height × channels.",
    ),
    {
      type: "cat",
      q: "Sort each dataset by its shape.",
      buckets: ["Vector data", "Time series", "Image or video"],
      items: [
        ["One house: size, rooms, age, price", 0],
        ["One film: length, year, rating", 0],
        ["Heart rate logged each second during a run", 1],
        ["A shop's daily sales over a year", 1],
        ["A photo of a receipt", 2],
        ["A doorbell camera clip", 2],
      ],
      why: "A single list of features is vector data, repeated measurements over time are a time series, and pictures (or sequences of them) are images and video.",
    },
    mc(
      "A greyscale photo has only one channel. What does that make it?",
      ["A matrix", "A vector", "A 4-order tensor"],
      "With one channel, width × height × 1 is just a grid: a matrix. (This detail is beyond the slides.)",
    ),
  ]);

  B.add("ds14-sparse", [
    mc(
      "What is a sparse tensor?",
      ["One in which most elements are 0", "One in which most elements are non-zero", "One with exactly one non-zero"],
      "Sparse means mostly zeros; dense means mostly non-zero values.",
    ),
    mc(
      "What does sparsity measure?",
      [
        "The proportion of zero-valued elements",
        "The size of the largest element",
        "How many dimensions the tensor has",
      ],
      "Sparsity is the share of the elements that are zero.",
    ),
    {
      type: "multi",
      q: "Which of these are given in the slides as very sparse real-world data?",
      o: ["A social graph", "Fault detection sensors", "A colour photo", "A short list of features"],
      a: [0, 1],
      why: "Each person links to only a few others, and fault sensors read “no fault” almost all the time. A photo is usually dense.",
    },
    mc(
      "For a big n × n tensor, when do the slides call it sparse?",
      [
        "When its non-zeros number roughly in the order of n",
        "When its non-zeros number roughly n × n, one per cell",
        "When it holds no non-zeros at all",
      ],
      "About n non-zeros out of n × n cells means only a tiny share is filled.",
    ),
    mc(
      "Why is a matrix with n around a million a problem to store in full?",
      [
        "Every one of its million million cells would need memory",
        "Its values are too precise for 64 bits",
        "Computers cannot hold more than a million rows",
      ],
      "n × n cells of 64 bits each is prohibitive. A sparse representation stores only the non-zeros instead.",
    ),
    mc(
      "A table is 90% non-zero. Is a sparse representation a good idea?",
      [
        "No: it is dense, and storing positions too costs more",
        "Yes: sparse formats save space on every kind of table",
        "Yes: dense tables cannot be stored at all",
      ],
      "Sparse formats store a position with each value. For a dense table that overhead outweighs the zeros saved.",
    ),
    {
      type: "cat",
      q: "Sparse or dense?",
      buckets: ["Sparse", "Dense"],
      items: [
        ["Which of a million products each customer bought", 0],
        ["Who follows whom on a social network", 0],
        ["The pixels of a holiday photo", 1],
        ["Daily temperatures of ten cities", 1],
      ],
      why: "Purchases and follows leave almost every cell at 0. Photos and temperature tables have a value in nearly every cell.",
    },
  ]);
})();
