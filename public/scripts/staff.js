function updateResults() {
    let searchItem = document.getElementById('search').value
    let children = document.getElementById('staffpage').children; //get container element children.
    let e, name
    if (searchItem == ''){
        for (let i = 0, len = children.length ; i < len; i++) {
            e = children[i]
            e.style.display = "inline-block"
            e.style.visibility = 'visible'    
        }
    }else{
        console.log(searchItem)
        for (let i = 0, len = children.length ; i < len; i++) {
            e = children[i]
            name = e.id
            if (name.slice(0, searchItem.length).toLowerCase() == searchItem.toLowerCase()){
                e.style.display = 'inline-block'
                e.style.visibility = 'visible'  
            }else {
                e.style.display = 'none'
                e.style.visibility = 'hidden'
            }
        }
    }
    return false//Prevent refresh
}