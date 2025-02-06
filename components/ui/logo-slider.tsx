import { motion } from 'framer-motion';
import Image from 'next/image';

export function LogoSection() {

  return (
    <section className="w-full bg-[#131C2B] py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl text-white">
          Partners
        </h2>
        <p className="mt-2 text-center md:text-lg text-gray-300">
            We are proud to be working with the following companies.
        </p>
        <div
          className="relative mt-10 flex overflow-hidden p-4"
          style={{
            maskImage:
              "linear-gradient(to left, transparent 0%, grey 20%, grey 80%, transparent 95%)",
          }}
        >
          <motion.div
            className="flex items-center gap-8"
            animate={{
              x: [-100, 0],
            }}
            transition={{
              ease: "linear",
              duration: 20,
              repeat: Infinity,
            }}
          >
            {[...LOGOS, ...LOGOS].map((logo, key) => (
              <div
                key={key}
                className="h-12 w-36 px-4 flex items-center justify-center"
              >
                <Image
                  src={logo.url || "/placeholder.svg"}
                  width={150}
                  height={48}
                  className="h-12 w-auto object-contain filter invert brightness-200"
                  alt={logo.name}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const LOGOS = [
  {
    name: "Dynamic",
    url: "https://cdn.prod.website-files.com/626692727bba3f384e008e8a/632d74b82fd2862796d5f6a0_logo-dark.svg",
  },
  {
    name: "ElizaOS",
    url: "https://github.com/elizaOS/brandkit/blob/main/logos/eliza-os_logo-mark_light.png?raw=true",
  },
  {
    name: "Supabase",
    url: "supabase_brand_assets/supabase-logo-wordmark--light.svg",
  },
  {
    name: "Vercel",
    url: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg",
  },
  {
    name: "Microsoft Azure",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Microsoft_Azure_Logo.svg/2560px-Microsoft_Azure_Logo.svg.png",
  }
];
