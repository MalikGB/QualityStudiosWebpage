function updateResults() {    
    let searchItem = document.getElementById('search').value
    let checks = [document.getElementById('barber'), document.getElementById('lash technician'), document.getElementById('other')]
    let rows = Array.from(document.getElementById('schedule').rows).slice(1) //get rows but skip header rows
    console.log(rows)
    let state = true
    let e, name, col_class
    checks.forEach( e => {
        if (!e.checked) {
            state = false
        }
    })
    if (searchItem == '' && state) {
        for (let i = 0, len = rows.length ; i < len; i++) {  
            e = rows[i]
            console.log(e)
            e.style.display = ''  
        }
    }else{
        for (let i = 0, len = rows.length ; i < len; i++) { //Reminder: html collections don't have forEach()
            e = rows[i]
            name = e.id
            col_class = e.cells[0].className
            console.log(col_class)
            if (name.slice(0, searchItem.length).toLowerCase() == searchItem.toLowerCase() && document.getElementById(col_class).checked) {
                e.style.display = '' 
            }else if (document.getElementById(col_class).checked && searchItem == '') {
                e.style.display = '' 
            } else {
                e.style.display = 'none'
            }
        }
    }
    return false//Prevent refresh
}
