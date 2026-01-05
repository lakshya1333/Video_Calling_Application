import React from 'react'

const useAuthuser = () => {
    //tanstack query
  const authUser = useQuery({
    queryKey: ["authUser"],

    queryFn: getAuthUser,
    retry: false
  })

  return {isLoading: authUser.isLoading,authUser: authUser.data?.user}

}

export default useAuthuser