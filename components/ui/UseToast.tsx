import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map()

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners = []

let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Helper function to merge Tailwind classes properly
// This prevents class conflicts and ensures our base styles are always applied
function mergeTailwindClasses(...classes) {
  // Filter out falsy values
  const filteredClasses = classes.filter(Boolean);
  
  // Create a map to track which utility types have been set
  const classMap = new Map();
  
  // Process each class string
  filteredClasses.forEach(classString => {
    if (typeof classString !== 'string') return;
    
    const individualClasses = classString.split(' ').filter(Boolean);
    
    individualClasses.forEach(cls => {
      // Extract the utility type (e.g., 'bg' from 'bg-white', 'shadow' from 'shadow-lg')
      const utilityType = cls.split('-')[0];
      
      // Store the class, later ones override earlier ones for the same utility type
      classMap.set(utilityType, cls);
      
      // Also store the full class for utilities that don't follow the prefix pattern
      if (!cls.includes('-')) {
        classMap.set(cls, cls);
      }
    });
  });
  
  return Array.from(classMap.values()).join(' ');
}

function toast({ ...props }) {
  const id = genId()

  const update = (props) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast: (props) => {
      // Base styling that should always be present
      const baseClassName = "border-0 shadow-lg";
      
      // Variant-specific background styling
      let variantClassName = "";
      if (props.variant === "destructive") {
        variantClassName = "bg-red-50 text-red-900 border border-red-200";
      } else {
        // Default and 'success' variants get white background
        variantClassName = "bg-white";
      }
      
      // Merge classes: base + variant + any custom classes from props
      // Later classes override earlier ones for the same utility type
      const finalClassName = mergeTailwindClasses(
        baseClassName,
        variantClassName,
        props.className
      );
      
      const styledProps = {
        ...props,
        className: finalClassName,
      };
      
      return toast(styledProps);
    },
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }