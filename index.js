let pre = `http://localhost:6900`
let invs = [];
let url = `${pre}/invoices-per`;
$('#myBtn').click(function(){

    var xhr = $.post(url, { query : 'fJname', direction : 'DESC'} )
        
        .done(function(data){
            $('#root').html(htmlHandleFetchData(data))
        })
        .then(function(data){
           invs = data;
        })

})

function htmlHandleFetchData(data){
    let html = `
    <table class="table">
  <thead>
    <tr>
      <th scope="col">ID</th>
      <th scope="col">Jobname</th>
      <th scope="col">Address</th>
      <th scope="col">PO</th>

    </tr>
  </thead>
  <tbody>
    `;
    let count = 0;
    data.forEach(d => {
        html += `
    <tr>
      <th scope="row">
            <button id="prodBtn${d.invoiceId}" class="btn btn-sm btn-outline-dark p-1" style="width:34px;" 
                    data-bs-toggle="modal" data-bs-target="#productModal" onclick="htmlProducts(${count++})">${d.invoiceId}
            </button>
            
            
      </th>
      <td>${d.fJname}</td>
      <td>${d.fAddress}</td>
      <td><a href="${d.fImg}">${d.fPo}</a></td>

      
    </tr>    
        `
    });


    html += `
    
      </tbody>
</table>


    `

    html += modal();
    return html;
}


function htmlProducts(i){
    let html = `
      <li class="list-unstyled">Id: <span id="idElem">${invs[i].invoiceId}</span> </li>
      <li class="list-unstyled">Vendor: ${JSON.parse(invs[i].fVendor)[0].name} </li>
      <li class="list-unstyled">Vendor: ${invs[i].fDate} </li>
      <li class="list-unstyled">Job Name: ${invs[i].fJname} </li>
      <li class="list-unstyled">Address: ${invs[i].fPo} </li>
      <li class="list-unstyled">Address: ${invs[i].fAddress} </li>
      <li class="list-unstyled">City: ${invs[i].fCity}, ${invs[i].fState} ${invs[i].fZip} </li>
      
    `;
    html += `
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Item</th>
          <th scope="col">Description</th>
          <th scope="col">Qty</th>
          <th scope="col">Cost</th>
        </tr>
      </thead>
      <tbody>
    `;


    let prod = (JSON.parse((invs[i]).fProducts));

    prod.forEach(p => {

      html += `
          <tr id="row${p.prodId}">
            <th scope="row">
            <button onclick="editProductRow(${p.prodId})" class="btn border-0 btn-sm p-0">
              <img src="assets/edit-black.png" width="23">
            </button>
            <span class="prodId" id="prodId${p.prodId}">${p.prodId}</span>
            </th>
            <td class="item" id="pItem${p.prodId}">${p.item}</td>
            <td class="description" id="pDescription${p.prodId}">${p.description}</td>
            <td class="qty" id="pQty${p.prodId}">${p.qty}</td>
            <td class="cost" id="pCost${p.prodId}">${p.cost}</td>
          </tr>
      
      `
    })
  
  
    html += `
        </tbody>
      </table>

      <h4 class="float-end">$<span id="modalCost">${invs[i].cost}</span>.00</h4>
    `
    $('#productModalBody').html(html);
    return html;
}


function editProductRow(id){
  let row = document.getElementById(`row${id}`);
  let prodId = document.getElementById(`prodId${id}`).innerHTML
  let item = document.getElementById(`pItem${id}`)
  let description = document.getElementById(`pDescription${id}`)
  let qty = document.getElementById(`pQty${id}`)
  let cost = document.getElementById(`pCost${id}`)
  let html = `
            <th><span class="prodId d-none" id="prodId${prodId}" >${prodId}</span>
            </th>
            <td class="item" id="pItem${id}" contenteditable="true"> ${item.innerHTML} </td>
            <td class="description" id="pDescription${id}" class="bg-edit" contenteditable="true"> ${description.innerHTML} </td>
            <td class="qty" id="pQty${id}"  contenteditable="true"> ${qty.innerHTML} </td>
            <td class="cost" id="pCost${id}"  contenteditable="true" onkeyup="getInvoiceCost()"> ${cost.innerHTML} </td>
          `;

  row.innerHTML = html;
  
}
function modal(){
    return `
    <div class="modal" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-fullscreen">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="productModalLabel">Invoice</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="productModalBody">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" onclick="saveEdittedProduct()">Save changes</button>
      </div>
    </div>
  </div>
</div>
    
    
    `
}

function saveEdittedProduct(){
  let arr = [];
  let obj = {};
    let prodId =  document.querySelectorAll('.prodId');
    let items = document.querySelectorAll('.item');
    let description = document.querySelectorAll('.description');
    let qty = document.querySelectorAll('.qty');
    let cost = document.querySelectorAll('.cost');
    for (let i = 0; i < items.length; i++){
      let obj = {
        'prodId' : prodId[i].innerHTML.trim(),
        'item' : items[i].innerHTML.trim(),
        'description' : description[i].innerHTML.trim(),
        'qty' : qty[i].innerHTML.trim(),
        'cost' : cost[i].innerHTML.trim()
      }
    arr.push(obj);
    }

    let id = Number(document.getElementById('idElem').innerHTML);
    let rec;
    invs.forEach(inv => {
      if (inv.invoiceId == id) { rec = inv }
    })
    rec.fProducts = JSON.stringify(arr);
    rec.cost = document.getElementById('modalCost').innerHTML


    
    let url = `${pre}/update-invoice`

    var xhr = $.post(url, rec, function(){
      // console.log('success');
    })
      .done(function(data){
        document.getElementById('productModalBody').innerHTML += `<div class="alert alert-info small" style="width:12rem;">${data}</div>`;
      })
      .fail(function(){
        document.getElementById('productModalBody').innerHTML += `<div class="alert alert-danger small" style="width:12rem;">process failed</div>`;

      })


      
    return rec;
}

function getInvoiceCost() {

  let costs = document.querySelectorAll('.cost')
  let total = 0;
  costs.forEach(c => {
    total = total + Number(c.innerHTML)
  })
  document.getElementById('modalCost').innerHTML = total;
}