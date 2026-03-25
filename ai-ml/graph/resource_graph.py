from langgraph.graph import StateGraph, START, END
from state.agent_state import ResourceState
from node.agent_nodes import resource_agent_node

def build_resource_graph():
    graph_builder = StateGraph(ResourceState)
    
    graph_builder.add_node("resource_agent", resource_agent_node)
    
    graph_builder.add_edge(START, "resource_agent")
    graph_builder.add_edge("resource_agent", END)
    
    return graph_builder.compile()

resource_app = build_resource_graph()
