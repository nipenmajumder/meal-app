<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Deposit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class DepositTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_deposits(): void
    {
        $this->get('/deposits')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_view_deposits_index(): void
    {
        $user = User::factory()->create(['status' => 1]);

        $this->actingAs($user)
            ->get('/deposits')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('deposits/Index')
                ->has('users')
                ->has('data')
                ->has('userNames')
                ->has('currentMonth')
                ->has('monthlyStats')
            );
    }

    public function test_users_can_create_deposit(): void
    {
        $user = User::factory()->create(['status' => 1]);
        $depositData = [
            'user_id' => $user->id,
            'date' => now()->format('Y-m-d'),
            'amount' => 1500.50,
        ];

        $this->actingAs($user)
            ->post('/deposits', $depositData)
            ->assertRedirect()
            ->assertSessionHas('success', 'Deposit saved successfully.');

        $this->assertDatabaseHas('deposits', $depositData);
    }

    public function test_creating_deposit_validates_required_fields(): void
    {
        $user = User::factory()->create(['status' => 1]);

        $this->actingAs($user)
            ->post('/deposits', [])
            ->assertSessionHasErrors(['user_id', 'date', 'amount']);
    }

    public function test_creating_deposit_validates_user_exists(): void
    {
        $user = User::factory()->create(['status' => 1]);

        $this->actingAs($user)
            ->post('/deposits', [
                'user_id' => 999,
                'date' => now()->format('Y-m-d'),
                'amount' => 1500.50,
            ])
            ->assertSessionHasErrors(['user_id']);
    }

    public function test_creating_deposit_validates_amount_is_numeric_and_positive(): void
    {
        $user = User::factory()->create(['status' => 1]);

        $this->actingAs($user)
            ->post('/deposits', [
                'user_id' => $user->id,
                'date' => now()->format('Y-m-d'),
                'amount' => -100,
            ])
            ->assertSessionHasErrors(['amount']);

        $this->actingAs($user)
            ->post('/deposits', [
                'user_id' => $user->id,
                'date' => now()->format('Y-m-d'),
                'amount' => 'invalid',
            ])
            ->assertSessionHasErrors(['amount']);
    }

    public function test_creating_deposit_validates_date_not_in_future(): void
    {
        $user = User::factory()->create(['status' => 1]);

        $this->actingAs($user)
            ->post('/deposits', [
                'user_id' => $user->id,
                'date' => now()->addDay()->format('Y-m-d'),
                'amount' => 1500.50,
            ])
            ->assertSessionHasErrors(['date']);
    }

    public function test_users_can_update_existing_deposit(): void
    {
        $user = User::factory()->create(['status' => 1]);
        $deposit = Deposit::factory()->create([
            'user_id' => $user->id,
            'amount' => 1000.00,
        ]);

        $this->actingAs($user)
            ->put("/deposits/{$deposit->id}", [
                'amount' => 1500.50,
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Deposit updated successfully.');

        $this->assertDatabaseHas('deposits', [
            'id' => $deposit->id,
            'amount' => 1500.50,
        ]);
    }

    public function test_updating_deposit_validates_amount(): void
    {
        $user = User::factory()->create(['status' => 1]);
        $deposit = Deposit::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->put("/deposits/{$deposit->id}", [
                'amount' => -100,
            ])
            ->assertSessionHasErrors(['amount']);
    }

    public function test_users_can_delete_deposit(): void
    {
        $user = User::factory()->create(['status' => 1]);
        $deposit = Deposit::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete("/deposits/{$deposit->id}")
            ->assertRedirect()
            ->assertSessionHas('success', 'Deposit deleted successfully.');

        $this->assertDatabaseMissing('deposits', [
            'id' => $deposit->id,
        ]);
    }

    public function test_deposit_creation_or_update_for_same_user_and_date(): void
    {
        $user = User::factory()->create(['status' => 1]);
        $date = now()->format('Y-m-d');

        // Create first deposit
        $this->actingAs($user)
            ->post('/deposits', [
                'user_id' => $user->id,
                'date' => $date,
                'amount' => 1000.00,
            ]);

        $this->assertDatabaseCount('deposits', 1);

        // Create second deposit for same user and date - should update existing
        $this->actingAs($user)
            ->post('/deposits', [
                'user_id' => $user->id,
                'date' => $date,
                'amount' => 1500.00,
            ]);

        $this->assertDatabaseCount('deposits', 1);
        $this->assertDatabaseHas('deposits', [
            'user_id' => $user->id,
            'date' => $date,
            'amount' => 1500.00,
        ]);
    }

    public function test_deposits_index_can_filter_by_month(): void
    {
        $user = User::factory()->create(['status' => 1]);

        // Create deposit in current month
        Deposit::factory()->create([
            'user_id' => $user->id,
            'date' => now(),
        ]);

        // Create deposit in previous month
        Deposit::factory()->create([
            'user_id' => $user->id,
            'date' => now()->subMonth(),
        ]);

        $previousMonth = now()->subMonth()->format('Y-m');

        $this->actingAs($user)
            ->get("/deposits?month={$previousMonth}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('currentMonth', $previousMonth)
            );
    }
}
