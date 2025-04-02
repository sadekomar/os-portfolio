export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log(searchParams);

  const item = {
    id: "f99ae27f-e456-40c1-837c-6ba424553d29",
    name: "[PRE-ORDER] The Nefertiti Beyoncé Drop",
    description: "The Nefertiti Beyoncé hoodie in charcoal grey",
    createdAt: "2025-03-31T02:59:24.087Z",
    updatedAt: "2025-03-31T02:59:24.744Z",
    gender: "UNISEX",
    material: {
      name: "other",
    },
    images: [
      {
        url: "https://asilieg.com/cdn/shop/products/PHOTO-2022-03-12-04-00-25_loom-image-dimensionsx.jpg?v=1647108212",
      },
      {
        url: "https://asilieg.com/cdn/shop/products/PHOTO-2022-03-12-03-46-41_loom-image-dimensionsx.jpg?v=1647109150",
      },
      {
        url: "https://asilieg.com/cdn/shop/products/PHOTO-2022-03-12-03-46-42_loom-image-dimensionsx.jpg?v=1647109150",
      },
    ],
    sizes: [
      {
        name: "S",
        available: false,
      },
      {
        name: "M",
        available: false,
      },
      {
        name: "L",
        available: false,
      },
      {
        name: "XL",
        available: false,
      },
    ],
    colors: [
      {
        name: "black",
      },
    ],
    brand: {
      name: "asili",
    },
    categories: [
      {
        name: "hoodies",
      },
    ],
    prices: [
      {
        price: 940,
        createdAt: "2025-03-31T02:59:24.087Z",
      },
    ],
  };

  return Response.json(item);
}
