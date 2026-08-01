import {

    db,
    collection,
    getDocs

} from "./firebase.js";



async function loadHistory(){


    const snapshot = await getDocs(
        collection(db,"races")
    );


    const table =
    document.getElementById("historyTable");


    table.innerHTML="";


    snapshot.forEach(doc=>{


        const data = doc.data();


        const result=data.result;



        table.innerHTML += `

        <tr>

            <td>
                ${formatDate(data.date)}
            </td>


            <td class="result">
                🥇 ${result.first}
            </td>


            <td>
                🥈 ${result.second}
            </td>


            <td>
                🥉 ${result.third}
            </td>


            <td>
                ${result.fourth}
            </td>


        </tr>


        `;


    });



}



function formatDate(timestamp){


    if(!timestamp)
        return "-";


    let date;


    if(timestamp.toDate){

        date=timestamp.toDate();

    }
    else{

        date=new Date(timestamp);

    }


    return date.toLocaleString("th-TH");


}



loadHistory();