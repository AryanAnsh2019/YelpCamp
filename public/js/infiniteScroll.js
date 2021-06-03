 if (campgrounds.previous.page == null) { 
  console.log('Previous disbaled');
 } else { 
  console.log("previous")
 } 


 let i = (Number(campgrounds.previous.page+1) > 5 ? Number(campgrounds.previous.page+1) - 4 : 1) 
 if (i !== 1) {
 console.log('...')
 }
for (; i <= (Number(campgrounds.previous.page+1) + 4) && i <= campgrounds.pages; i++) {
   if (i == campgrounds.previous.page+1) { 
      console.log(`Active ${i}`)
   } else { 
      console.log(i);
   } 
  if (i == Number(campgrounds.previous.page+1) + 4 && i < campgrounds.pages) { 
     console.log('...')
   } 
 } 
if (campgrounds.next.page == campgrounds.pages) { 
  console.log('Disabled next')
} else { 
  console.log('Next');
 } 