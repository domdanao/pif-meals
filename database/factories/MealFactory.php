<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Meal>
 */
class MealFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $mealNames = [
            'Chicken Adobo with Rice',
            'Beef Sinigang with Rice',
            'Pork Sisig',
            'Vegetable Lumpia (5 pieces)',
            'Fish Fillet with Vegetables',
            'Chicken Curry with Rice',
            'Beef Tapa with Rice',
            'Pancit Canton',
            'Grilled Bangus with Rice',
            'Vegetable Salad Bowl',
            'Chicken Teriyaki with Rice',
            'Pork Menudo with Rice',
            'Beef Caldereta with Rice',
            'Mixed Vegetables with Tofu',
            'Fried Chicken with Rice',
        ];

        $categories = ['Main Course', 'Vegetarian', 'Rice Meals', 'Snacks', 'Healthy Options'];

        $name = fake()->randomElement($mealNames);
        $isVegetarian = str_contains(strtolower($name), 'vegetable') || str_contains(strtolower($name), 'tofu');

        return [
            'name' => $name,
            'description' => fake()->sentence(8),
            'price' => fake()->randomFloat(2, 50, 200),
            'category' => fake()->randomElement($categories),
            'is_vegetarian' => $isVegetarian,
            'is_halal' => fake()->boolean(70),
            'contains_nuts' => fake()->boolean(20),
            'contains_dairy' => fake()->boolean(30),
            'allergen_info' => fake()->boolean(40) ? fake()->sentence(3) : null,
            'image_url' => null,
            'quantity_available' => fake()->numberBetween(0, 50),
            'is_active' => fake()->boolean(90),
            'created_by' => User::where('role', 'admin')->first()?->id ?? User::factory()->create(['role' => 'admin']),
        ];
    }

    /**
     * Indicate that the meal is vegetarian.
     */
    public function vegetarian(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_vegetarian' => true,
            'name' => fake()->randomElement([
                'Vegetable Lumpia (5 pieces)',
                'Mixed Vegetables with Tofu',
                'Vegetable Salad Bowl',
                'Veggie Burger with Fries',
                'Tofu Adobo with Rice',
            ]),
        ]);
    }

    /**
     * Indicate that the meal is out of stock.
     */
    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity_available' => 0,
        ]);
    }

    /**
     * Indicate that the meal is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
