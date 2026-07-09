import "./ProblemSelector.css";

const items=[

"🏠 Home",

"🚗 Vehicle",

"🎉 Events",

"📚 Learning",

"💼 Business"

];

function ProblemSelector(){

return(

<div className="problemContainer">

{items.map((item,index)=>(

<div className="problemCard"

key={index}>

{item}

</div>

))}

</div>

);

}

export default ProblemSelector;