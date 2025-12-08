import React, { useEffect,useState, useRef} from "react";
import { data } from "react-router-dom";

function InfiniteScroll() {
    const [items, setItems] = useState([]);
    const [offsetId, setOffsetId] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loading = useRef(false);
    const sectionRef = useRef(null);
    
    async function fetchData(){
        if(loading.current)
        {
            return;
        }
        console.log("asdfasdf")
        try{
            loading.current = true;
        const response  = await fetch(`https://api.escuelajs.co/api/v1/products?offset=${items.length}&limit=10`);
        const data = await response.json();
        if(data.length ===0 )
        {
            setHasMore(false);
        }
        setItems((prev)=>[...prev, ...data]);
        loading.current=false;
        }
        catch(e){
            console.warn("Some Error occured");
            setItems([]);   
        }
        finally{
            loading.current=false
        }
    }

 
    useEffect(() => {
        const section = sectionRef.current;
           function handleScroll(){
            if(!hasMore || loading.current)
            return;
        const {scrollHeight, scrollTop, clientHeight} = sectionRef.current;

        if(scrollHeight - (scrollTop + clientHeight) < 100){
            fetchData();
        }
    }
        if(!section)
        {
            return;
        }
        section.addEventListener('scroll', handleScroll)
        return(()=>{
            section.removeEventListener('scroll', handleScroll);
        })
    }, [items, hasMore]);

    useEffect(()=>{
        fetchData();
    },[])
  return (
    <div>
      <div className="isheader"><h1 >Infinite Scroll offsetId</h1></div>
      <section className="isContainer" ref={sectionRef}>
        {
            //     "id": 7,
//     "title": "Classic Comfort Drawstring Joggers",
//     "slug": "classic-comfort-drawstring-joggers",
//     "price": 790,
//     "description": "opium",
//     "category": {
//       "id": 1,
//       "name": "Clothes",
//       "slug": "clothes",
//       "image": "https://i.imgur.com/QkIa5tT.jpeg",
//       "creationAt": "2025-12-06T04:55:59.000Z",
//       "updatedAt": "2025-12-06T04:55:59.000Z"
//     },
//     "images": [
//       "https://i.imgur.com/mp3rUty.jpeg"
//     ],
//     "creationAt": "2025-12-06T04:55:59.000Z",
//     "updatedAt": "2025-12-06T13:52:01.000Z"
//   }
                items.map((item)=>{
            return(<div key={item.id} className="isItem">
                 <img src={item.images} alt={item.title}/>
                <span>{item.title}</span>
                <span>{item.description}</span>
                 </div>)
            })
        }
      </section>
    </div>
  );
}

export default InfiniteScroll;