const app = {};
app.entityId = "";
app.entityType ="";
app.userCuisine ="";

//The app.Initial function initialize the all process - the function stop the form from being submitted, 
//and transfer the values we're getting from the user to the function app.apiLocation, that getting the api 
//and handle all this info.

app.Initial = () => {
$(".search").on("click", function(event){
  event.preventDefault();
  const values = $("input").val();
  app.apiLocation(values);
});
}

//The app.apiLocation is calling the api according to what Location (name and type of the location) the user ask for 
//and pass the result to the app.apiCuisines function.
app.apiLocation = (userVal) => {
  $.ajax({
    url:"https://developers.zomato.com/api/v2.1/locations",
    method:"GET",
    dataType:"json", 
    data: {
      query: userVal
    },
    headers:{
      "user-key": "35a7558c496667f5ef419052347d87e3",
    }
  }).then(function(result) {
    
    app.entityId = result.location_suggestions[0].entity_id;
    app.entityType = result.location_suggestions[0].entity_type;

    app.apiCuisines(app.entityId);
  });
}

//The app.apiCuisines gets an array of cuisines all around the city the user picked.
//it sends the array to the app.shuffleCuisines function - that function going to shuffle the array and return it back
//The resualt array is going to sent to the function app.showCuisines.

app.apiCuisines = (cityId) => {
  $.ajax({
    url:"https://developers.zomato.com/api/v2.1/cuisines",
    method:"GET",
    dataType:"json",
    data:{
      city_id: cityId
    },
    headers:{
      "user-key": "35a7558c496667f5ef419052347d87e3",
    }
  }).then(function(result2){
    const shuffledArray = app.shuffleCuisines(result2) 
    app.showCuisines(shuffledArray);

  },function(error){
    console.log("error",error)
  }); 
}


//The function app.shuffleCuisines is going  over the Cuisines array and shuffle it.
app.shuffleCuisines = (cuisineArray) => {
  let j, x, i;
  let cuisineArrayNew = cuisineArray.cuisines

  for (i = cuisineArrayNew.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = cuisineArrayNew[i];
      cuisineArrayNew[i] = cuisineArrayNew[j];
      cuisineArrayNew[j] = x;
    }
  return cuisineArrayNew;
}

//The function app.showCuisines prints 5 random cuisines from the shuffled array 
//on the screan for the user to pick up from.
app.showCuisines = (shuffledArray) => {
  let cuisineOption = shuffledArray.slice(0,5)
  let user = $("#cuisine");
  let list = $("<ul>");
  $("#cuisine").empty();
  for(let i = 0; i < cuisineOption.length; i++){
    let item = $("<li>");
    let input ='<input type="radio" name="Cuisines" value="' + cuisineOption[i].cuisine.cuisine_id + '" /> ';
    input += cuisineOption[i].cuisine.cuisine_name;
    item.append(input);
    list.append(item);
  }
  let submit = '<input type="submit" value="submit" class="userChoice"/>';
  user.append(list);
  user.append(submit);
  app.userCuisineSelection();
}

//The function app.userCuisineSelection gets the cuisine that the user choose and pass it 
//to the function api.Search with two other arguments.
app.userCuisineSelection = () => {
  $(".userChoice").on("click", function(event){
    event.preventDefault();
    app.userCuisine = $('input[name = "Cuisines"]:checked').val();
    app.apiSearch(app.entityId, app.entityType, app.userCuisine);
  });
}

//The app.apiSearch function call an api that gets information, 
//about restuarnts around the city from the cuisine the user picked.
//some of the information we get is rating, reviews, address, 
//operations hours, contact information and more.
app.apiSearch = (city_id, city_name, cuisine) => {
  $.ajax({
    url:"https://developers.zomato.com/api/v2.1/search",
    method: "GET",
    dataType: "json",
    data:{
      entity_id: city_id,
      entity_type: city_name,
      cuisines: cuisine,
      sort: "rating",
      order: "desc"
    },
    headers:{
      "user-key": "35a7558c496667f5ef419052347d87e3",
    }
  }).then(function(finel_res){
    app.displayRestaurant(finel_res.restaurants); 
  });
}

//The function app.displayRestaurant gets the restaurants details from the function app.apiSearch
//and prints it nicly on the screen
app.displayRestaurant = (restaurants) => {
  $('.restaurantResult').remove();
  $('body').append('<div class="restaurantResult"><div>');
 
  restaurants.forEach(item => {
    const restaurantDetails = `
      <div class="item">
        <div class="item-image">
          <h2>${item.restaurant.name}</h2>
          <h3>${item.restaurant.cuisines}</h3>
          <img src="${item.restaurant.featured_image}" class ="mainPhoto" alt="restaurant main photo"> 
        </div>
        <div class="item-body">
          <p>address: ${item.restaurant.location.address}</p>
          <p>phone:  ${item.restaurant.phone_numbers}</P>
          <h4>rate: ${item.restaurant.user_rating.aggregate_rating}</h4>
          <h4>${item.restaurant.user_rating.rating_text}</h4>
        </div>
      </div>
    `
    $(".restaurantResult").append(restaurantDetails); 
  });
  
  $(".restaurantResult").flickity({
    freeScroll: true,
    wrapAround: true,
    autoPlay: 3000,
    pageDots: false,
    prevNextButtons: false
  });
}

  $(function(){

    app.Initial();
  });