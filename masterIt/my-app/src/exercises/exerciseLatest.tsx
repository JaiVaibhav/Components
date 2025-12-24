// import React, { useEffect } from "react";


// const ItemHeight = 200; // Height of each item including margin/padding
// const containerheight = 600; // Height of the scrollable container
// export default function ExerciseLatest() {

//     const [items, setItems] = React.useState<[]>([]);
//     const [scrollTop, setScrollTop] = React.useState(0);
//     const sectionRef = React.useRef<HTMLElement | null>(null);
//    async function fetchData() {  
//         const responseData = await fetch('https://dummyjson.com/products?limit=200');
//         const data = await responseData.json();
//         setItems(data.products);
//     }


// const startIndex = Math.floor(scrollTop / ItemHeight);

// const endIndex = Math.min(
//   Math.floor((scrollTop + containerheight) / ItemHeight) + 1,
//   items.length
// );
//     const visualItems= items.slice(
//         Math.floor(scrollTop / ItemHeight),
//         Math.floor((scrollTop + containerheight) / ItemHeight) + 1
//     );
//     const topSpacerHeight = startIndex * ItemHeight;
// const bottomSpacerHeight =
//   Math.max(0, (items.length - endIndex) * ItemHeight);
//     React.useEffect(() => {
//         // Simulate fetching data
//         fetchData();
//     },[])



//     useEffect(() => {   
//         if(!sectionRef.current) return;
//         const sectionElement = sectionRef.current;

//         function handleScroll(){
//             console.log("scrolling");
//             setScrollTop(sectionElement.scrollTop);
//         }
//         sectionElement.addEventListener('scroll', handleScroll);

//         return () => {
//             sectionElement.removeEventListener('scroll', handleScroll);
//         };

//     },[])
//   return (
//     <div>
//       <h1>Exercise Latest</h1>
//       <p>This is the latest exercise component.</p>
//         <section ref={sectionRef} style={{height:"400px",overflowY:"auto",border:"1px solid black",padding:"10px"}} >
//         <div style={{ height: topSpacerHeight }} />
//         <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px"}}>
//             {
//                 visualItems.map((item:any)=>(
//                     <div key={item.id} style={{border:"1px solid black",padding:"10px"}}>
//                         <img src={item.images[0]} alt={item.title} width="200px" height="200px"/>
//                         <h3>{item.title}</h3>
//                         <p>Price: ${item.price}</p>
//                     </div>
//                 ))
//             }
//         </div>
//           <div style={{ height: bottomSpacerHeight }} />
//         </section>
//     </div>
//   );
// }


import React, { useEffect, useRef, useState } from "react";

const ITEM_HEIGHT = 200;      // MUST match rendered item height
const CONTAINER_HEIGHT = 400; // MUST match section height

export default function ExerciseLatest() {
  const [items, setItems] = useState<any[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  async function fetchData() {
    const res = await fetch("https://dummyjson.com/products?limit=200");
    const data = await res.json();
    setItems(data.products);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Core virtualization math
  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);

  const endIndex = Math.min(
    Math.floor((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);

  const topSpacerHeight = startIndex * ITEM_HEIGHT;
  const bottomSpacerHeight = Math.max(
    0,
    (items.length - endIndex) * ITEM_HEIGHT
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      setScrollTop(el.scrollTop);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <h1>Virtualized List (Level 1)</h1>

      <section
        ref={sectionRef}
        style={{
          height: CONTAINER_HEIGHT,
          overflowY: "auto",
          border: "1px solid black",
        }}
      >
        {/* TOP SPACER */}
        <div style={{ height: topSpacerHeight }} />

        {/* VISIBLE ITEMS */}
        <div>
          {visibleItems.map((item) => (
            <div
              key={item.id}
              style={{
                height: ITEM_HEIGHT,
                boxSizing: "border-box",
                border: "1px solid black",
                padding: "10px",
                overflow: "hidden",
              }}
            >
              <img
                src={item.images[0]}
                alt={item.title}
                width="180"
                height="120"
              />
              <h4>{item.title}</h4>
              <p>${item.price}</p>
            </div>
          ))}
        </div>

        {/* BOTTOM SPACER */}
        <div style={{ height: bottomSpacerHeight }} />
      </section>
    </div>
  );
}
