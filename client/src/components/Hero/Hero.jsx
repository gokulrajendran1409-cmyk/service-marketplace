import { motion } from "framer-motion";
import {
  Search,
  Wrench,
  Car,
  GraduationCap,
  Briefcase,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

const categories = [
  {
    title: "Home",
    icon: Wrench,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Vehicle",
    icon: Car,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Learning",
    icon: GraduationCap,
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Business",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-700",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5EE] px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      {/* Background Effects */}
      <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full bg-yellow-200/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">


          {/* LEFT SIDE */}

          <motion.div
            initial={{opacity:0,y:40}}
            animate={{opacity:1,y:0}}
            transition={{duration:0.7}}
          >


            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 shadow-md">

              <Star 
                size={16}
                fill="currentColor"
                className="text-yellow-500"
              />

              <span className="font-medium">
                Trusted by thousands
              </span>

            </div>



            {/* Heading */}

            <h1 className="mt-8 max-w-xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">

              Find Trusted

              <span className="block text-emerald-700">
                Professionals
              </span>

              Near You

            </h1>



            {/* Description */}

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">

              Book verified electricians, plumbers,
              cleaners, mechanics and skilled professionals
              within minutes.

            </p>



            {/* Search Box */}

            <div className="mt-10 rounded-3xl bg-white p-2 shadow-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center px-3 sm:flex-1">
                  <Search className="ml-2 text-gray-400" size={22} />
                  <input
                    type="text"
                    placeholder="Need a plumber, electrician or cleaner?"
                    className="w-full bg-transparent px-4 py-4 text-base outline-none sm:py-5 sm:text-lg"
                  />
                </div>

                <button className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-4 font-semibold text-white transition hover:bg-emerald-800 sm:mr-2 sm:px-7 sm:py-5">
                  Search
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>



            {/* Features */}

            <div className="mt-8 flex flex-wrap gap-4 text-sm sm:gap-6">


              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={18}
                  className="text-emerald-700"
                />

                Verified Professionals

              </div>



              <div className="flex items-center gap-2">

                <Zap
                  size={18}
                  className="text-yellow-500"
                />

                Instant Booking

              </div>



              <div className="flex items-center gap-2">

                <Star
                  size={18}
                  className="text-orange-500"
                />

                Top Rated Experts

              </div>


            </div>



            {/* Categories */}

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">


              {categories.map((item)=>{

                const Icon=item.icon;


                return(

                  <div
                    key={item.title}
                    className="
                    rounded-3xl
                    bg-white
                    p-5
                    shadow-lg
                    transition
                    hover:-translate-y-2
                    hover:shadow-xl
                    "
                  >


                    <div
                      className={`
                      inline-flex 
                      rounded-2xl 
                      p-3 
                      ${item.color}
                      `}
                    >

                      <Icon size={24}/>

                    </div>


                    <h3 className="mt-4 font-bold">
                      {item.title}
                    </h3>


                  </div>

                )

              })}


            </div>



          </motion.div>





          {/* RIGHT SIDE IMAGE */}


          <motion.div
            initial={{opacity:0,x:60}}
            animate={{opacity:1,x:0}}
            transition={{duration:0.8}}
            className="relative mx-auto w-full max-w-[520px]"
          >
            <div className="overflow-hidden rounded-[32px] bg-white p-3 shadow-2xl sm:rounded-[40px] sm:p-5">


              <img

                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200"

                alt="Professional Service"

                className="h-[420px] w-full rounded-[24px] object-cover sm:h-[500px] lg:h-[560px]"

              />


            </div>




            {/* Floating Card 1 */}


            <div
              className="
              absolute
              left-3
              top-6
              rounded-3xl
              bg-white
              p-4
              shadow-2xl
              sm:left-4
              sm:top-10
              sm:p-5
              lg:-left-8
              lg:top-16
              "
            >

              <p className="text-sm text-gray-500">
                Professionals
              </p>


              <h2 className="text-4xl font-black">
                2,340+
              </h2>


              <p className="text-emerald-700">
                Online Today
              </p>


            </div>





            {/* Floating Card 2 */}


            <div
              className="
              absolute
              bottom-4
              right-3
              rounded-3xl
              bg-white
              p-4
              shadow-2xl
              sm:bottom-6
              sm:right-4
              sm:p-5
              lg:-right-6
              lg:bottom-10
              "
            >

              <p className="text-sm text-gray-500">
                Customer Rating
              </p>


              <h2 className="text-4xl font-black">
                ⭐ 4.9
              </h2>


            </div>



          </motion.div>


        </div>

      </div>


    </section>
  );
}