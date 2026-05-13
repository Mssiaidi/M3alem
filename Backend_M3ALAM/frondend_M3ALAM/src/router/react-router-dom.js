import {
  Children,
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const RouterContext = createContext(null)
const RouteParamsContext = createContext({})

function normalizePath(pathname) {
  if (!pathname) return '/'
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

function matchPath(routePath, pathname) {
  const cleanRoute = normalizePath(routePath)
  const cleanPath = normalizePath(pathname)

  if (cleanRoute === '*') {
    return {}
  }

  const routeSegments = cleanRoute.split('/').filter(Boolean)
  const pathSegments = cleanPath.split('/').filter(Boolean)

  if (routeSegments.length !== pathSegments.length) {
    return null
  }

  const params = {}

  for (let index = 0; index < routeSegments.length; index += 1) {
    const routeSegment = routeSegments[index]
    const pathSegment = pathSegments[index]

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(pathSegment)
      continue
    }

    if (routeSegment !== pathSegment) {
      return null
    }
  }

  return params
}

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }))

  useEffect(() => {
    const onPopState = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      })
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (to) => {
    if (to === `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      return
    }

    window.history.pushState({}, '', to)
    setLocation({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    })
  }

  const value = useMemo(() => ({ location, navigate }), [location])

  return createElement(RouterContext.Provider, { value }, children)
}

export function Link({ to, className, children, ...props }) {
  const router = useContext(RouterContext)

  return createElement(
    'a',
    {
      ...props,
      href: to,
      className,
      onClick: (event) => {
        if (props.onClick) props.onClick(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }

        event.preventDefault()
        router.navigate(to)
      },
    },
    children,
  )
}

export function Route() {
  return null
}

export function Routes({ children }) {
  const router = useContext(RouterContext)
  const routeList = Children.toArray(children)

  for (const routeElement of routeList) {
    const { path, element } = routeElement.props
    const params = matchPath(path, router.location.pathname)

    if (params !== null) {
      return createElement(
        RouteParamsContext.Provider,
        { value: params },
        element,
      )
    }
  }

  return null
}

export function useLocation() {
  const router = useContext(RouterContext)
  return router.location
}

export function useParams() {
  return useContext(RouteParamsContext)
}
