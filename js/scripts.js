var navigate = (function() {
	$('.dd').toggle();
	$('.dd_btn').click(function() {
		var dataName = $(this).attr('data-name');
		$('.dd').hide();
		$('.' + dataName).toggle();
	});
})();

{ // main
  const elmCtorNames = getCandidates();
  const db = [];
  for (const elmCtorName of elmCtorNames) {
    const ctor = window[elmCtorName];
    db.push({
      name: elmCtorName,
      pCount: propCount(ctor),
      soCount: subobjectCount(ctor)
    });
  }

  // gen <tr>s; recycle
  for (let i=0; i<db.length; i++) {
    elTBody.insertAdjacentHTML("beforeend", `<tr>
    <td /><td /><td />
    </tr>`);
  }

  // reg ev
  elSort.addEventListener("click", onSort);

  // sort first col
  onSort({target: elSort.children[0]});

  function onSort(e) {
    const elm = e.target;
    const field = elm.dataset.field;
    const order = elm.dataset.order ? Number(elm.dataset.order) * -1: 1;
    populate(db, makePred({order, field}));
    elm.dataset.order = order; // update
    for (const thElm of Array.from(elSort.children))
      thElm.classList.remove("asc", "desc");
    elm.classList.add(order > 0 ? "asc": "desc");
  }
}

// Determine how many props can be accessed thru elm
// - ignore obscured props eg "constructor"
//
function propCount(elmCtor) {
  const names = new Set();
  let proto = elmCtor.prototype;
  while (proto) {
    for (const name of Object.getOwnPropertyNames(proto))
      names.add(name);
    proto = Object.getPrototypeOf(proto);
  }
  return names.size;
}

// Determine how "long" the proto chain is.
// - ignore last `null` object
// - <video> & <audio> extends a mystery elm, HTMLMediaElement
function subobjectCount(elmCtor) {
  let c = 0;
  let p = elmCtor.prototype;
  while(p) {
    c += 1;
    p = Object.getPrototypeOf(p);
  }
  return c;
}

//
// find HTML*Element elms
//
function getCandidates() {
  const cands = [];
  const names = Array.from(Object.getOwnPropertyNames(window));
  for (const name of names) {
    if (/^HTML.+Element$/.test(name))
      cands.push(name);
  }
  return cands;
}

//
// update existing <td>s
//
function populate(db, sortFn) {
  const trElms = elTBody.children;
  db.sort(sortFn);

  for (const [i, dat] of db.entries()) {
    const trElm = trElms[i];
    const tdElms = trElm.children;
    const [,s0,s1,s2] = dat.name.match(/^(HTML)(.+)(Element)$/);
    tdElms[0].innerHTML = `${s0}<span class="elm-name">${s1}</span>${s2}`;
    tdElms[1].textContent = dat.pCount;
    tdElms[2].textContent = dat.soCount;
  }
}

// Make cmp fn for Array.prototype.sort
// It works for str and num.
// {order} is either 1 or -1(desc)
// {field} is a string key ... db[n][field]
function makePred({order, field}) {
  return function (a,b) {
    if (a[field] > b[field]) return order;
    else if (a[field] < b[field]) return -order;
    else 0;
  };
}
