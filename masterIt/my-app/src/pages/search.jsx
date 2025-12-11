import React, { useEffect, useState } from "react";


   function handleClickThrottle(callback){
        let throttled = false;
        return function(...args){
            console.log("handleClickThrottle", throttled)
            if(throttled === false)
            {
                throttled=true;
             setTimeout(()=>{
                    callback.apply(this, args)
                    throttled=false;
            }, 1000);
            }
        }
    }
export default function SearchFunctionality()
{
    const [searchText, setSearchText] = useState("");
    const [bookData, setBookData] = useState([]);
    const [showThrottleText, setShowThrottleText] = useState(false);
    const [text, setText] = useState("");
    async function fetchItems()
    {
        const response = await fetch(`https://openlibrary.org/search.json?q=${searchText}&fields=title,author_name,first_publish_year`);
        const responseData= await response.json();
        if(responseData.numFound > 0)
        {
            const bookDetails = (responseData.docs.slice(0,10))?.map((book)=>{
                return {
                    title: book.title,
                    authorName: book.author_name?.join(', '),
                    firstPublishYear:book.first_publish_year
                }
            })
            setBookData(bookDetails);
        }
    }
    useEffect(()=>{
        const timer = setTimeout(()=>{
            setBookData([])
            if(searchText.length>=3)
                fetchItems();
        },750);
        return ()=>clearTimeout(timer);
    },[searchText])

    function handleInputChange(e){
        const {name, value} = e.target;
        console.log(name, value);
        setSearchText(value);
    }

   const throttleClick = handleClickThrottle(()=>{
            setShowThrottleText(true);
            setText((prev)=>prev+" hello");
   })

    return <main>
        {/* <header>Search Functionality</header> */}
        {/* <div>
            <label>Enter any Book name : </label>
            <input value={searchText} type="text" onChange={handleInputChange} name="firstPublishYear"/>
        </div> */}
        {/* <section className="booksContainer">
                        {
                bookData.map((item)=>{
                return <div className="bookDetails">
                    <span>{item.title}</span>
                    <span>{item.authorName}</span>
                    <span>{item.firstPublishYear}</span>
                        </div>
                        })
                        }
                    
        </section> */}
        {
            showThrottleText && <span>{text}</span>
        }
        <button onClick={throttleClick}>Click Me</button>
    </main>
}