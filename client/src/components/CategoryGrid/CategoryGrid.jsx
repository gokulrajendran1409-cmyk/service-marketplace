import {
  Home,
  Car,
  GraduationCap,
  Briefcase
} from "lucide-react";


const categories=[

{
title:"Home Services",
icon:Home
},

{
title:"Automobile",
icon:Car
},

{
title:"Education",
icon:GraduationCap
},

{
title:"Business",
icon:Briefcase
}

];



export default function CategoryGrid(){


return(


<section className="bg-[#F8F5EE] px-4 py-20 sm:px-6 lg:px-8">
<div className="mx-auto max-w-6xl">



<h2
className="
mb-10
text-center
text-4xl
font-extrabold
"
>

Explore Categories

</h2>




<div
className="
grid
gap-6
sm:grid-cols-2
lg:grid-cols-4
"
>


{
categories.map((item)=>{


const Icon=item.icon;


return(

<div

key={item.title}

className="
group
rounded-3xl
bg-white
p-8
text-center
shadow-md
transition
hover:-translate-y-2
hover:shadow-xl
"

>


<div
className="
mx-auto
flex
h-16
w-16
items-center
justify-center
rounded-full
bg-emerald-100
text-emerald-700
"
>

<Icon size={32}/>

</div>



<h3
className="
mt-5
font-bold
"
>

{item.title}

</h3>


<button
className="
mt-4
text-sm
font-semibold
text-emerald-700
"
>

Explore →

</button>


</div>


)


})

}



</div>


</div>


</section>


)

}