import { Icon } from "@iconify/react";
import { PiArrowCircleRight, PiTagDuotone } from "react-icons/pi";

import Link from "next/link";

// export const meta: Metadata = {
//   title: "Dia",
//   description: "👜 Compra y disfruta de una expericia para mejorar tu calidad de vida."
// }

export default function Index() {
  return (
    <div className="">
      <div className="bg-zinc-100">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 container py-3">
          <div className="flex items-center gap-3 justify-start">
            <Icon icon="fluent-emoji:delivery-truck" className="text-5xl" />
            <span className="font-medium">Cash on delivery</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon icon="noto:speedboat" className="text-5xl mb-5" />
            <span className="font-medium">Fast shipping</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon icon="solar:chat-round-call-broken" className="text-5xl" />
            {/* <Icon
            icon="solar:chat-round-call-bold-duotone"
            className="text-5xl"
          /> */}
            <span className="font-medium">Support 24/7h</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon icon="simple-line-icons:tag" className="text-5xl" />
            <span className="font-medium">Price Match</span>
          </div>
        </div>
      </div>
      <div
        className="relative h-96 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://galaximart.com/cdn/shop/files/open-plan-kitchen-with-wooden-fixtures.jpg?v=1727737561&width=2400)",
        }}
      >
        <div className="bg-zinc-900/60 absolute inset-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button className="border-2 border-white text-white font-semibold text-lg px-4 py-2 rounded-lg text-nowrap">
            Comprar ahora
          </button>
        </div>
      </div>
      <section className="container my-16">
        <div className="flex justify-between items-center pb-2">
          <h2 className="font-semibold text-3xl">Marble Dining Sets</h2>
          <Link href="/products" className="text-blue-500">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3"></div>
      </section>

      <section className="container grid grid-cols-2 md:grid-cols-5 gap-3">
        <article className="p-4 flex flex-col gap-2 items-center">
          <div className="relative">
            <img
              src="https://galaximart.com/cdn/shop/files/DT235-Photoroom_c50c40d9-cf4d-4618-a8ba-537b38dfbeea.jpg?v=1708274255&width=1500"
              alt=""
            />
            <span className="absolute left-0 top-0 space-x-1 bg-red-800 px-1.5 py-1 text-xs text-white flex items-center">
              <PiTagDuotone className="text-base" />
              <span>Up to 33% off</span>
            </span>
          </div>
          <div className="space-y-1.5 py-2">
            <p className="text-sm font-light text-zinc-600">GalaxiMart</p>
            <h3 className="font-semibold">
              Chicago Extending 160cm-200cm Cream & Gold Dining Table and Dining
              Chairs
            </h3>
            <div className="">
              <div className="my-2 border-y border-y-zinc-200 py-2">
                <div className="text-lg text-red-600">
                  <span className="text-sm">from</span> <b>S/. 599.90</b>
                  <span className="ml-2 text-base font-medium text-zinc-500 line-through decoration-2">
                    S/. 599.90
                  </span>
                </div>
              </div>
              <div>
                <img
                  src="https://galaximart.com/cdn/shop/files/DT235-Photoroom_c50c40d9-cf4d-4618-a8ba-537b38dfbeea.jpg?crop=center&height=48&v=1708274255&width=48"
                  alt=""
                  className="h-8 rounded-full"
                />
              </div>
            </div>
            <button className="block w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white">
              Choose options
            </button>
          </div>
        </article>
      </section>
      <section className="relative">
        <img
          src="https://galaximart.com/cdn/shop/files/chastity-cortijo-R-w5Q-4Mqm0-unsplash_2acbe1dc-8dae-444a-b58f-fff35d5d4fb8.jpg?v=1702102389&width=2400"
          alt=""
          className="h-[70vh] w-full bg-center object-cover"
        />
        <div className="absolute inset-0 flex w-full flex-col items-center justify-center bg-black/50 text-white">
          <h2 className="text-5xl font-bold leading-3">GalaxiMart</h2>
          <p className="my-7 max-w-2xl text-center text-xl">
            Winters Sale await. Discover the seasons must-haves at incredible
            prices. Dont miss out!
          </p>

          <button className="block rounded-lg border-2 border-white bg-transparent px-4 py-2.5 text-sm font-semibold">
            Learn More
          </button>
        </div>
      </section>
      <section className="container my-12">
        <div className="grid gap-2 w-full md:grid-cols-4">
          <div className="md:col-span-1 bg-teal-800 text-white">
            <img
              src="https://galaximart.com/cdn/shop/files/christian-kaindl-4uD9w-pxBTA-unsplash_1_62c58724-08b6-4f0c-8571-a31fc929984f.jpg?v=1703965975&width=1500"
              alt=""
              className="h-44 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-3xl font-semibold">
                Elevate Your Living Space with Our Sofa Collection
              </h3>
              <p className="my-5 text-sm font-medium leading-7">
                Immerse yourself in comfort and style with our curated
                collection of sofas, designed to transform your living room into
                a haven of relaxation and sophistication.
              </p>
              <button className="block w-full rounded-lg border-2 border-white bg-transparent px-4 py-2.5 text-sm font-semibold">
                Shop Now
              </button>
            </div>
          </div>
          <div className="md:col-span-3 overflow-y-hidden">
            <div className="flex flex-nowrap overflow-x-scroll snap-mandatory snap-x">
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
              <div className="shrink-0 px-1 snap-center max-w-80"></div>
            </div>
          </div>
        </div>
      </section>
      <div className="container my-12 grid md:grid-cols-2">
        <div className="flex justify-center items-center">
          <img
            src="https://galaximart.com/cdn/shop/files/Untitled_design_30.png?v=1702404105&width=781"
            alt=""
          />
        </div>
        <div className="flex items-start justify-center flex-col pr-32">
          <h3 className="font-semibold text-3xl">Wooden Collection</h3>
          <p className="my-4 leading-7">
            GalaxiMarts wooden collection isnt just furniture; its an invitation
            to natures warm embrace. Crafted from sustainably sourced wood, each
            piece whispers a story of time and artistry, its unique grain
            patterns a canvas for your own homes narrative. Step into GalaxiMart
            and discover the magic of wood.
          </p>
          <button className="block rounded-lg border-2 border-black bg-transparent px-4 py-2.5 text-sm font-semibold">
            Learn More
          </button>
        </div>
      </div>
      <section className="container my-12">
        <h2 className="text-3xl font-semibold">Collection List</h2>
        <div className="grid lg:grid-cols-4 gap-4">
          <article className="bg-zinc-200">
            <img
              src="https://galaximart.com/cdn/shop/files/katja-rooke-77JACslA8G0-unsplash.jpg?v=1704050081&width=875"
              alt=""
              className="aspect-video object-cover"
            />
            <div className="text-white bg-zinc-800 font-semibold text-lg py-3 px-6">
              Furniture
            </div>
            <ul className="divide-y px-6 divide-zinc-400 border-b py-4 pb-2">
              <li className="py-2">Furniture</li>
              <li className="py-2">Dining</li>
              <li className="py-2">Rugs</li>
              <li className="py-2">Sofas</li>
              <li className="py-2">Lighting</li>
              <li className="py-2">Home Accessories</li>
              <li className="py-2">Garden Furniture</li>
              <li className="py-2">Pine Wood</li>
              <li />
            </ul>
            <div className="grid place-content-center py-4 pt-2">
              <button className="flex items-center gap-1">
                <PiArrowCircleRight className="text-4xl" />
                <span className="text-lg">Aprende como</span>
              </button>
            </div>
          </article>
        </div>
      </section>
      <section className="container my-12">
        <div className="flex flex-col items-center justify-center">
          <div className="max-w-3xl text-center">
            <h2 className="text-3xl font-semibold">
              Discover the Brilliance: Unveiling Our Diverse Lamp Collection
            </h2>
            <p>
              From the breathtaking shimmer of our glass pendants, casting
              mesmerizing shadows, to the warm glow of our plush velvet shades,
              each lamp is a masterpiece of artistry and light. Explore our
              curated selection and discover the perfect piece to ignite your
              imagination and transform your home into a haven of luminescence.
              Let our lamps be the guiding light on your journey to creating a
              space that reflects your individuality and inspires joy..
            </p>
          </div>
        </div>
        <div className="overflow-x-scroll no-scrollbar">
          <table className="bg-zinc-200 w-full">
            <thead>
              <tr>
                <th></th>
                <th>
                  <article className="p-4 flex flex-col gap-2 items-center">
                    <div className="w-40">
                      <img
                        src="https://galaximart.com/cdn/shop/files/rsz_b2163084868f4c4e834e1987d1d4647b.jpg?v=1696168637&width=400"
                        alt=""
                      />
                    </div>
                    <h4 className="font-semibold text-zinc-800 text-sm">
                      44.5cm Chrome Pleated Glass with Silver Satin Shade Table
                      Lamp
                    </h4>
                    <button className="bg-zinc-700 p-2 rounded-md text-white text-sm font-medium">
                      View details
                    </button>
                  </article>
                </th>
                <th>
                  <article className="p-4 flex flex-col gap-2 items-center">
                    <div className="w-40">
                      <img
                        src="https://galaximart.com/cdn/shop/files/rsz_b2163084868f4c4e834e1987d1d4647b.jpg?v=1696168637&width=400"
                        alt=""
                      />
                    </div>
                    <h4 className="font-semibold text-zinc-800 text-sm">
                      44.5cm Chrome Pleated Glass with Silver Satin Shade Table
                      Lamp
                    </h4>
                    <button className="bg-zinc-700 p-2 rounded-md text-white text-sm font-medium">
                      View details
                    </button>
                  </article>
                </th>
                <th>
                  <article className="p-4 flex flex-col gap-2 items-center">
                    <div className="w-40">
                      <img
                        src="https://galaximart.com/cdn/shop/files/rsz_b2163084868f4c4e834e1987d1d4647b.jpg?v=1696168637&width=400"
                        alt=""
                      />
                    </div>
                    <h4 className="font-semibold text-zinc-800 text-sm">
                      44.5cm Chrome Pleated Glass with Silver Satin Shade Table
                      Lamp
                    </h4>
                    <button className="bg-zinc-700 p-2 rounded-md text-white text-sm font-medium">
                      View details
                    </button>
                  </article>
                </th>
                <th>
                  <article className="p-4 flex flex-col gap-2 items-center">
                    <div className="w-40">
                      <img
                        src="https://galaximart.com/cdn/shop/files/rsz_b2163084868f4c4e834e1987d1d4647b.jpg?v=1696168637&width=400"
                        alt=""
                      />
                    </div>
                    <h4 className="font-semibold text-zinc-800 text-sm">
                      44.5cm Chrome Pleated Glass with Silver Satin Shade Table
                      Lamp
                    </h4>
                    <button className="bg-zinc-700 p-2 rounded-md text-white text-sm font-medium">
                      View details
                    </button>
                  </article>
                </th>
                <th>
                  <article className="p-4 flex flex-col gap-2 items-center">
                    <div className="w-40">
                      <img
                        src="https://galaximart.com/cdn/shop/files/rsz_b2163084868f4c4e834e1987d1d4647b.jpg?v=1696168637&width=400"
                        alt=""
                      />
                    </div>
                    <h4 className="font-semibold text-zinc-800 text-sm">
                      44.5cm Chrome Pleated Glass with Silver Satin Shade Table
                      Lamp
                    </h4>
                    <button className="bg-zinc-700 p-2 rounded-md text-white text-sm font-medium">
                      View details
                    </button>
                  </article>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-400 border-t border-t-zinc-400 select-none">
              <tr className="hover:bg-zinc-300">
                <td className="p-4">
                  <b>By:</b>
                </td>
                <td className="p-4">GalaxiMart</td>
                <td className="p-4">GalaxiMart</td>
                <td className="p-4">GalaxiMart</td>
                <td className="p-4">GalaxiMart</td>
                <td className="p-4">GalaxiMart</td>
              </tr>
              <tr className="hover:bg-zinc-300">
                <td className="p-4">
                  <b>Price:</b>
                </td>
                <td className="p-4 text-red-500 font-bold">£135.00</td>
                <td className="p-4 text-red-500 font-bold">£235.00</td>
                <td className="p-4 text-red-500 font-bold">£120.00</td>
                <td className="p-4 text-red-500 font-bold">£250.00</td>
                <td className="p-4 text-red-500 font-bold">£235.00</td>
              </tr>
              <tr className="hover:bg-zinc-300">
                <td className="p-4">
                  <b>Description:</b>
                </td>
                <td className="p-4">
                  This 44.5cm Chrome Pleated Glass Table Lamp offers an
                  intriguing fusion of sophistication and contemporary...
                </td>
                <td className="p-4">
                  This sleek 70cm X shaped table lamp is designed with a durable
                  metallic base for...
                </td>
                <td className="p-4">
                  This 59.5cm Clear Glass Table Lamp with Black Velvet Shade
                  Silver Inside radiates sophistication and...
                </td>
                <td className="p-4">
                  This unique floor lamp makes an eye-catching addition to any
                  room with its glass base...
                </td>
                <td className="p-4">
                  This 77.5cm Table Lamp combines contemporary chrome-colored
                  glass with a pleated design for an eye-catching...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      {/* <Testimonials /> */}
    </div>
  );
}
