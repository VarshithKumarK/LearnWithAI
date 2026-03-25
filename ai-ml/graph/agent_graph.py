from langgraph.graph import StateGraph, START, END
from state.agent_state import AgentState
from node.agent_nodes import (
    intake_node, 
    prerequisite_mapper, 
    path_builder, 
    resource_fetcher, 
    progress_evaluator, 
    adaptive_node
)

def route_flow(state: AgentState):
    """
    Route to the appropriate flow based on whether there's progress/feedback 
    (indicating an update/adaptive flow) or not (initial flow).
    """
    if state.get("progress") or state.get("feedback"):
        return "progress_evaluator"
    return "prerequisite_mapper"

def build_graph():
    # Initialize StateGraph with the TypedDict state
    graph_builder = StateGraph(AgentState)
    
    # Add nodes to graph
    graph_builder.add_node("intake", intake_node)
    graph_builder.add_node("prerequisite_mapper", prerequisite_mapper)
    graph_builder.add_node("path_builder", path_builder)
    graph_builder.add_node("resource_fetcher", resource_fetcher)
    graph_builder.add_node("progress_evaluator", progress_evaluator)
    graph_builder.add_node("adaptive_node", adaptive_node)
    
    # Establish edges
    graph_builder.add_edge(START, "intake")
    
    # Conditional logic after intake
    # If it's an update, go to progress_evaluator, else prerequisite_mapper
    graph_builder.add_conditional_edges(
        "intake",
        route_flow,
        {
            "progress_evaluator": "progress_evaluator",
            "prerequisite_mapper": "prerequisite_mapper"
        }
    )
    
    # Initial Flow mapping
    graph_builder.add_edge("prerequisite_mapper", "path_builder")
    
    # Adaptive Flow mapping
    graph_builder.add_edge("progress_evaluator", "adaptive_node")
    graph_builder.add_edge("adaptive_node", "path_builder")
    
    # Shared end flow
    graph_builder.add_edge("path_builder", "resource_fetcher")
    graph_builder.add_edge("resource_fetcher", END)
    
    return graph_builder.compile()

# Compile the graph
agent_app = build_graph()
