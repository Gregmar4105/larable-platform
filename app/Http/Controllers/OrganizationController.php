<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationRequest;
use App\Http\Requests\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Display a listing of organizations.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $organizations = $user->organizations()
            ->withCount('users')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('organizations/index', [
            'organizations' => $organizations,
            'currentOrganizationId' => session('current_organization_id'),
        ]);
    }

    /**
     * Redirect create action to index page with create query param.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('organizations.index', ['create' => 'true']);
    }

    /**
     * Store a newly created organization in storage.
     */
    public function store(StoreOrganizationRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']).'-'.Str::random(5);
        }

        $organization = Organization::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'plan' => $validated['plan'] ?? 'Free',
            'description' => $validated['description'] ?? null,
        ]);

        // Attach owner to organization_user pivot
        $organization->users()->attach($user->id, ['role' => 'owner']);

        // Auto-switch to newly created organization
        session(['current_organization_id' => $organization->id]);

        return redirect()->route('organizations.index')
            ->with('success', 'Organization created successfully.');
    }

    /**
     * Redirect edit action to index page with edit query param.
     */
    public function edit(Request $request, Organization $organization): RedirectResponse
    {
        if (! $request->user()->organizations()->where('organizations.id', $organization->id)->exists()) {
            abort(403);
        }

        return redirect()->route('organizations.index', ['edit' => $organization->id]);
    }

    /**
     * Update the specified organization in storage.
     */
    public function update(UpdateOrganizationRequest $request, Organization $organization): RedirectResponse
    {
        if (! $request->user()->organizations()->where('organizations.id', $organization->id)->exists()) {
            abort(403);
        }

        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $organization->update($validated);

        return redirect()->route('organizations.index')
            ->with('success', 'Organization updated successfully.');
    }

    /**
     * Remove the specified organization from storage.
     */
    public function destroy(Request $request, Organization $organization): RedirectResponse
    {
        if (! $request->user()->organizations()->where('organizations.id', $organization->id)->exists()) {
            abort(403);
        }

        $organization->delete();

        // Reset active session if deleted org was active
        if (session('current_organization_id') === $organization->id) {
            session()->forget('current_organization_id');
        }

        return redirect()->route('organizations.index')
            ->with('success', 'Organization deleted successfully.');
    }

    /**
     * Switch the currently connected organization in session.
     */
    public function switch(Request $request, Organization $organization): RedirectResponse
    {
        if (! $request->user()->organizations()->where('organizations.id', $organization->id)->exists()) {
            abort(403);
        }

        session(['current_organization_id' => $organization->id]);

        return redirect()->back()->with('success', 'Switched to '.$organization->name);
    }
}
