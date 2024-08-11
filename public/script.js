const searchBtn = document.getElementById("search-btn");
const searchIcon = document.getElementById("search-icon");
const closeIcon = document.getElementById("close-icon");
const searchBox = document.getElementById("search-box");
const recipeContainer = document.getElementById("recipes-container");
const loadMoreBtn = document.getElementById("load-more-btn");
const loadingIndicator = document.getElementById("loading-indicator");
const emptyMessage = document.getElementById("emptyMessage");

let allMeals = [];
let currentIndex = 0;
const mealsPerLoad = 12;
let isSearchActive = false;

const toggleSearchIcon = () => {
    isSearchActive = !isSearchActive;
    if (isSearchActive) {
        searchIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
    } else {
        searchIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
    }
};


const saveToLocalStorage = () => {
    const data = {
        allMeals: allMeals,
        currentIndex: currentIndex,
        lastSearch: searchBox.value
    };
    localStorage.setItem('recipeAppState', JSON.stringify(data));
    localStorage.setItem('hasSearched', 'true'); // ذخیره وضعیت جستجو
}

const loadFromLocalStorage = () => {
    const savedState = localStorage.getItem('recipeAppState');
    const hasSearched = localStorage.getItem('hasSearched');

    if (savedState && hasSearched === 'true') {
        const data = JSON.parse(savedState);
        allMeals = data.allMeals;
        currentIndex = data.currentIndex;
        searchBox.value = data.lastSearch;

        recipeContainer.innerHTML = ''; // پاک کردن نتایج قبلی
        for (let i = 0; i < currentIndex; i++) {
            displayRecipe(allMeals[i]);
        }

        emptyMessage.classList.add('hidden'); // پنهان کردن پیام "Search your favorite food"

        if (currentIndex < allMeals.length) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    } else {
        emptyMessage.classList.remove('hidden'); // نمایش پیام "Search your favorite food"
        loadMoreBtn.classList.add('hidden');
    }

    loadingIndicator.classList.add('hidden'); // پنهان کردن نشانگر بارگذاری
}

const fetchRecipes = async (query) => {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        console.log("API Response:", data);

        if (data.meals) {
            allMeals = data.meals;
            currentIndex = 0;
            recipeContainer.innerHTML = ''; // پاک کردن نتایج قبلی
            emptyMessage.classList.add('hidden'); // پنهان کردن پیام "Search your favorite food"
            loadMoreRecipes();
            saveToLocalStorage();
        } else {
            recipeContainer.innerHTML = '<p class="text-center text-gray-500">No recipes found.</p>';
            loadMoreBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error fetching recipes:", error);
        recipeContainer.innerHTML = '<p class="text-center text-red-500">Error fetching recipes. Please try again.</p>';
        loadMoreBtn.classList.add('hidden');
    }
}

const displayRecipe = (meal) => {
    const foodCard = document.createElement('div');
    foodCard.className = 'rounded-lg border bg-white text-gray-900 shadow-sm p-4 flex flex-col gap-2';

    foodCard.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="rounded-md object-cover w-full h-32">
        <h3 class="text-lg font-semibold">${meal.strMeal}</h3>
        <p class="text-sm text-gray-500">${meal.strCategory}</p>
        <button class="mt-auto py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors">read recipes</button>
    `;

    recipeContainer.appendChild(foodCard);
}

const loadMoreRecipes = () => {
    loadMoreBtn.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    setTimeout(() => {
        const endIndex = Math.min(currentIndex + mealsPerLoad, allMeals.length);

        for (let i = currentIndex; i < endIndex; i++) {
            displayRecipe(allMeals[i]);
        }

        currentIndex = endIndex;

        if (currentIndex >= allMeals.length) {
            loadMoreBtn.classList.add('hidden');
        } else {
            loadMoreBtn.classList.remove('hidden');
        }

        loadingIndicator.classList.add('hidden');
        saveToLocalStorage(); // ذخیره‌سازی وضعیت جدید
    }, 1000); // تاخیر 1 ثانیه‌ای برای نمایش انیمیشن (می‌توانید این مقدار را تغییر دهید)
}

searchBtn.addEventListener("click", () => {
    toggleSearchIcon();

    if (isSearchActive) {
        const searchInput = searchBox.value.trim();
        if (searchInput) {
            fetchRecipes(searchInput);
        } else {
            recipeContainer.innerHTML = "";
            loadMoreBtn.classList.add('hidden');
            emptyMessage.classList.remove('hidden');
            localStorage.setItem('hasSearched', 'false');
        }
    } else {
        // اگر دکمه در حالت بستن است، جستجو را پاک کن
        searchBox.value = "";
        recipeContainer.innerHTML = "";
        loadMoreBtn.classList.add('hidden');
        emptyMessage.classList.remove('hidden');
        localStorage.setItem('hasSearched', 'false');
    }
});


window.addEventListener('load', loadFromLocalStorage);
loadMoreBtn.addEventListener("click", loadMoreRecipes);
