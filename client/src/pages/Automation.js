import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAutomation, testAutomation } from '../store/slices/automationSlice';
import { fetchProjects } from '../store/slices/projectSlice';

const Automation = () => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);
  const { automations, loading } = useSelector((state) => state.automations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    project: '',
    trigger: {
      type: 'status_change',
      conditions: []
    },
    actions: []
  });
  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const triggerTypes = [
    {
      id: 'status_change',
      name: 'Status Change',
      description: 'Trigger when a task status changes',
      fields: [
        {
          name: 'fromStatus',
          type: 'select',
          label: 'From Status',
          options: ['To Do', 'In Progress', 'Done']
        },
        {
          name: 'toStatus',
          type: 'select',
          label: 'To Status',
          options: ['To Do', 'In Progress', 'Done']
        }
      ]
    },
    {
      id: 'due_date',
      name: 'Due Date',
      description: 'Trigger when a task is due',
      fields: [
        {
          name: 'daysBefore',
          type: 'number',
          label: 'Days Before Due Date'
        }
      ]
    },
    {
      id: 'assignment',
      name: 'Assignment',
      description: 'Trigger when a task is assigned',
      fields: [
        {
          name: 'assignee',
          type: 'select',
          label: 'Assignee',
          options: projects.flatMap(p => p.members)
        }
      ]
    }
  ];

  const actionTypes = [
    {
      id: 'notify',
      name: 'Send Notification',
      description: 'Send a notification to team members',
      fields: [
        {
          name: 'message',
          type: 'text',
          label: 'Notification Message'
        },
        {
          name: 'recipients',
          type: 'multiselect',
          label: 'Recipients',
          options: projects.flatMap(p => p.members)
        }
      ]
    },
    {
      id: 'change_status',
      name: 'Change Status',
      description: 'Automatically change task status',
      fields: [
        {
          name: 'newStatus',
          type: 'select',
          label: 'New Status',
          options: ['To Do', 'In Progress', 'Done']
        }
      ]
    },
    {
      id: 'assign',
      name: 'Assign Task',
      description: 'Automatically assign the task',
      fields: [
        {
          name: 'assignee',
          type: 'select',
          label: 'Assignee',
          options: projects.flatMap(p => p.members)
        }
      ]
    }
  ];

  const handleAddTrigger = () => {
    setNewRule({
      ...newRule,
      trigger: {
        type: triggerTypes[0].id,
        conditions: []
      }
    });
  };

  const handleAddAction = () => {
    setNewRule({
      ...newRule,
      actions: [
        ...newRule.actions,
        {
          type: actionTypes[0].id,
          params: {}
        }
      ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format trigger conditions based on type
      const triggerConditions = {};
      switch (newRule.trigger.type) {
        case 'status_change':
          triggerConditions.from = newRule.trigger.conditions.fromStatus;
          triggerConditions.to = newRule.trigger.conditions.toStatus;
          break;
        case 'assignment':
          triggerConditions.assignee = newRule.trigger.conditions.assignee;
          break;
        case 'due_date':
          triggerConditions.daysBefore = parseInt(newRule.trigger.conditions.daysBefore);
          break;
        case 'comment_added':
          triggerConditions.keywords = newRule.trigger.conditions.keywords.split(',').map(k => k.trim());
          break;
      }

      // Format actions with proper parameters
      const formattedActions = newRule.actions.map(action => {
        const formattedAction = {
          type: action.type,
          params: {}
        };

        switch (action.type) {
          case 'change_status':
            formattedAction.params.newStatus = action.params.newStatus;
            break;
          case 'assign_user':
            formattedAction.params.assignee = action.params.assignee;
            break;
          case 'add_comment':
            formattedAction.params.comment = action.params.comment;
            break;
          case 'send_notification':
            formattedAction.params.message = action.params.message;
            formattedAction.params.recipients = action.params.recipients;
            break;
        }

        return formattedAction;
      });

      const automationData = {
        name: newRule.name,
        description: newRule.description,
        projectId: newRule.project,
        trigger: {
          type: newRule.trigger.type,
          conditions: triggerConditions
        },
        actions: formattedActions
      };

      await dispatch(createAutomation(automationData)).unwrap();
      setIsModalOpen(false);
      setNewRule({
        name: '',
        description: '',
        project: '',
        trigger: {
          type: 'status_change',
          conditions: {}
        },
        actions: []
      });
    } catch (error) {
      console.error('Failed to create automation:', error);
    }
  };

  const handleTest = async (automationId) => {
    try {
      const results = await dispatch(testAutomation(automationId)).unwrap();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to test automation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Automation Rules</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Rule
        </button>
      </div>

      {/* Automation Rules List */}
      <div className="grid grid-cols-1 gap-6">
        {automations.map((automation) => (
          <div
            key={automation._id}
            className="bg-white shadow rounded-lg p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {automation.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Project: {automation.project.title}
                </p>
              </div>
              <button
                onClick={() => handleTest(automation._id)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Test Rule
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Trigger</h4>
              <p className="mt-1 text-sm text-gray-600">
                {triggerTypes.find(t => t.id === automation.trigger.type)?.name}
              </p>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Actions</h4>
              <ul className="mt-2 space-y-2">
                {automation.actions.map((action, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {actionTypes.find(t => t.id === action.type)?.name}
                  </li>
                ))}
              </ul>
            </div>

            {testResults && testResults.automationId === automation._id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-900">Test Results</h4>
                <pre className="mt-2 text-sm text-gray-600">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create Automation Rule
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rule Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newRule.name}
                  onChange={(e) =>
                    setNewRule({ ...newRule, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="project"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project
                </label>
                <select
                  id="project"
                  value={newRule.project}
                  onChange={(e) =>
                    setNewRule({ ...newRule, project: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">Trigger</h3>
                <div className="mt-2">
                  <select
                    value={newRule.trigger.type}
                    onChange={(e) =>
                      setNewRule({
                        ...newRule,
                        trigger: { ...newRule.trigger, type: e.target.value }
                      })
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {triggerTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900">Actions</h3>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Add Action
                  </button>
                </div>
                <div className="mt-2 space-y-4">
                  {newRule.actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={action.type}
                        onChange={(e) => {
                          const updatedActions = [...newRule.actions];
                          updatedActions[index] = {
                            ...action,
                            type: e.target.value
                          };
                          setNewRule({
                            ...newRule,
                            actions: updatedActions
                          });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        {actionTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedActions = newRule.actions.filter(
                            (_, i) => i !== index
                          );
                          setNewRule({
                            ...newRule,
                            actions: updatedActions
                          });
                        }}
                        className="text-red-600 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automation; 