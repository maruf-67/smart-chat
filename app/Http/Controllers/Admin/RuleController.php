<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreRuleRequest;
use App\Http\Requests\UpdateRuleRequest;
use App\Services\RuleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin Rule Controller
 *
 * Handles auto-reply rule management for admin users.
 * This is a thin controller that delegates all business logic to RuleService.
 * Controllers are responsible only for HTTP concerns (request/response, rendering).
 *
 * Follows RESTful resource convention:
 * - index: list rules
 * - create: show create form
 * - store: save new rule
 * - edit: show edit form
 * - update: save changes
 * - destroy: delete rule
 *
 * @author Development Team
 *
 * @version 1.0
 */
class RuleController
{
    /**
     * RuleService instance for delegated operations.
     */
    public function __construct(private readonly RuleService $ruleService) {}

    /**
     * Display a list of all auto-reply rules.
     *
     * Shows paginated rules with filtering options.
     * All business logic is delegated to RuleService.
     *
     * @return Response Inertia response with rule list component
     *
     * @context Admin management of auto-reply rules
     */
    public function index(): Response
    {
        $filters = request()->all();
        $rules = $this->ruleService->getRules($filters);

        return Inertia::render('Admin/Rules/Index', [
            'rules' => $rules,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new rule.
     *
     * @return Response Inertia response with rule creation form
     *
     * @context Admin creating new auto-reply rule
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Rules/Create');
    }

    /**
     * Store a newly created rule in storage.
     *
     * Validates data via StoreRuleRequest and delegates creation to RuleService.
     * All business logic (validation, DB storage) handled by Form Request and Service.
     *
     * @param  StoreRuleRequest  $request  Validated rule data
     * @return RedirectResponse Redirect to rules index with success message
     *
     * @context Admin creating new auto-reply rule
     */
    public function store(StoreRuleRequest $request): RedirectResponse
    {
        $this->ruleService->createRule($request->validated());

        return redirect()->route('admin.rules.index')
            ->with('success', 'Auto-reply rule created successfully.');
    }

    /**
     * Show the form for editing an existing rule.
     *
     * @param  int  $id  Rule ID to edit
     * @return Response Inertia response with rule edit form
     *
     * @context Admin editing auto-reply rule
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found (404)
     */
    public function edit(int $id): Response
    {
        $rule = $this->ruleService->getRuleById($id);

        return Inertia::render('Admin/Rules/Edit', [
            'rule' => $rule,
        ]);
    }

    /**
     * Update an existing rule in storage.
     *
     * Validates data via UpdateRuleRequest and delegates update to RuleService.
     * All business logic handled by Form Request and Service.
     *
     * @param  UpdateRuleRequest  $request  Validated update data
     * @param  int  $id  Rule ID to update
     * @return RedirectResponse Redirect back to rules index with success message
     *
     * @context Admin updating auto-reply rule
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found (404)
     */
    public function update(UpdateRuleRequest $request, int $id): RedirectResponse
    {
        $this->ruleService->updateRule($id, $request->validated());

        return redirect()->route('admin.rules.index')
            ->with('success', 'Auto-reply rule updated successfully.');
    }

    /**
     * Delete a rule from storage.
     *
     * Delegates deletion to RuleService.
     *
     * @param  int  $id  Rule ID to delete
     * @return RedirectResponse Redirect back to rules index with success message
     *
     * @context Admin deleting auto-reply rule
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found (404)
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->ruleService->deleteRule($id);

        return redirect()->route('admin.rules.index')
            ->with('success', 'Auto-reply rule deleted successfully.');
    }
}
