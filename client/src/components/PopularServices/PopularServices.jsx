import {
  Wrench,
  Zap,
  Sparkles,
  Car,
  Paintbrush
} from "lucide-react";


const services=[

{
 title:"Plumbing",
 icon:Wrench,
 desc:"Pipe repair and maintenance"
},

{
 title:"Electrical",
 icon:Zap,
 desc:"Home electrical works"
},

{
 title:"Cleaning",
 icon:Sparkles,
 desc:"Professional cleaning"
},

{
 title:"Vehicle Repair",
 icon:Car,
 desc:"Bike and car service"
},

{
 title:"Painting",
 icon:Paintbrush,
 desc:"Interior and exterior painting"
}

];


export default function PopularServices(){


return(

<section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
<div className="mx-auto max-w-6xl">
<div className="mb-12 text-center">


<h2
className="
text-4xl
font-extrabold
text-slate-900
"
>

Popular Services

</h2>


<p className="mt-3 text-slate-600">

Find trusted experts near you

</p>


</div>




<div
className="
grid
gap-6
sm:grid-cols-2
lg:grid-cols-5
"
>


{
services.map((service)=>{


const Icon=service.icon;


return(


<div
key={service.title}
className="
rounded-3xl
bg-[#F8F5EE]
p-6
shadow-md
transition
hover:-translate-y-2
hover:shadow-xl
"
>


<div
className="
inline-flex
rounded-2xl
bg-white
p-4
text-emerald-700
"
>

<Icon size={28}/>

</div>


<h3
className="
mt-5
font-bold
"
>

{service.title}

</h3>


<p
className="
mt-2
text-sm
text-slate-600
"
>

{service.desc}

</p>


</div>


)


})

}



</div>


</div>


</section>


)

}