import {

    db,
    collection,
    getDocs,
    deleteDoc,
    doc

} from "./firebase.js";



async function loadHistory(){


    const snapshot = await getDocs(
        collection(db,"races")
    );


    const table =
    document.getElementById("historyTable");


    table.innerHTML="";


    snapshot.forEach(doc=>{

        const id = doc.id;

        const data = doc.data();

        const result=data.result;

        table.innerHTML += `

<tr>

    <td>
        Race #${data.raceNumber ?? "?"}
    </td>

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

    <td>

        <button 
        onclick="deleteHistory('${id}')"
        style="
        background:#d32f2f;
        padding:8px 15px;
        border-radius:8px;
        color:white;
        border:none;
        cursor:pointer;
        ">

        Delete

        </button>

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

window.deleteHistory = async function(id){


    if(!confirm("ต้องการลบประวัตินี้ไหม?"))
        return;



    try{


        await deleteDoc(
            doc(db,"races",id)
        );


        alert("ลบเรียบร้อย");


        loadHistory();


    }
    catch(error){


        console.error(
            "Delete error:",
            error
        );


    }


}


loadHistory();