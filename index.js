// Author: Riza Hassan
// Date: 04/19/2020
// Personal web: https://rizahassan.dev
// Github repo: https://github.com/rizahassan
// Email: ruhulruzbihan@gmail.com

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

//This function distribute the variants1 and variants2 equally using A/B Testing
//1.Get the cookie from the requested URL
//2.Check if cookies does not exist, then restart the client
async function setCookie(variant1, variant2, request) {
  const VAR1 = variant1;
  const VAR2 = variant2;
  const cookie = request.headers.get("Cookie");

  //If cookie does not exists, do the 50/50 split and set the cookie
  if (
    !(
      cookie &&
      (cookie.includes("$(NAME)=VAR1") || cookie.includes("$(NAME)=VAR2"))
    )
  ) {
    let group = Math.random() < 0.5 ? "VAR1" : "VAR2";
    let response = group === "VAR1" ? VAR1 : VAR2;
    response.headers.append("Set-Cookie", `${NAME}=${group}; path=/`);
    return response;
  }
}

//This function customizes/rewrite the HTML
const customized_variant = new HTMLRewriter()
  .on("title", {
    element: (i) => i.setInnerContent("RH App"),
  })
  .on("h1#title", {
    element: (i) => i.prepend("Summer 2020"),
  })
  .on("p#description", {
    element: (i) => i.setInnerContent("Riza Hassan"),
  })
  .on("a#url", {
    element: (i) =>
      i
        .setInnerContent("My website portfolio")
        .setAttribute("href", "https://www.rizahassan.dev/"),
  });

// This function outputs one of the two variants from the API
// 1. Fetch URL from API, parse the values as JSON, and then save into variables
// 2. Rewrite the HTML given from the two variants
// 3. Set cookies and return the response with 50/50 split
async function handleRequest(request) {
  var vararray;
  var variant_url;
  let input = await fetch(
    "https://cfw-takehome.developers.workers.dev/api/variants"
  )
    .then((response) => response.json())
    .then((data) => {
      vararray = data;
    });

  let variant1 = vararray.variants[0];
  let variant2 = vararray.variants[1];

  variant_url = vararray.variants[Math.round(Math.random())];
  let output_page = await fetch(variant_url).then((i) =>
    customized_variant.transform(i)
  );
  //Set the cookie and return response after 50/50 split
  setCookie(variant1, variant2, request);
  return output_page;
}
