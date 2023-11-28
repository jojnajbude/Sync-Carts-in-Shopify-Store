import { useCallback, useEffect, useMemo, useState } from "react"
import { Socket, io } from "socket.io-client";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

// const APP_URL = "public-url";
const APP_URL = 'public-url';

const useSocket = (customer?: string | number | undefined, cartId: string) => {
  const fetch = useAuthenticatedFetch();

  const [customerID, setCustomerID] = useState(null);
  const [data, setData] = useState<any[]>(null);
  const [online, setOnline] = useState(false);

  const [update, setUpdate] = useState(false);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [updateTimer, setUpdateTimer] = useMemo(() => {
    let timer: NodeJS.Timeout = null;

    const setTimer = () => {
      clearTimeout(timer);

      timer = setTimeout(() => {
        setUpdate(true);
      }, 500);
    }

    return [timer, setTimer]
  }, []);

  const [shop, setShop] = useState(null);

  useEffect(() => {
    fetch('/api/shop')
      .then(res => res.json())
      .then(res => {
        if (Array.isArray(res)) {
          setShop(res[0]);
        }
      });
  }, []);

  const socket = useMemo(() => {
    const socket = io(`${APP_URL}`, {
      path: '/storefront/synchronize'
    });

    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('online', (isOnline) => {
      console.log('online', isOnline)
      setOnline(isOnline);
    })

    socket.on('update', () => {
      setUpdateTimer();
    });

    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    socket.on('synchronize', (data) => {
      console.log('sync', data);
      setData(data);
    })

    return socket;
  }, []);

  useEffect(() => {
    if (!customer) {
      return;
    }

    const id = Number(
      customer.admin_graphql_api_id.split('/').pop()
    );
      
    if (customerID !== id) {
      setCustomerID(id);
    }
  }, [customer]);

  useEffect(() => {
    if (customerID) {
      socket.emit('session', {
        customer: customerID,
        admin: true,
        cartId: cartId
      });
    } else {
      socket.emit('session');
    }
  }, [customerID]);

  useEffect(() => {
    if (update) {
      setUpdateCounter(updateCounter + 1);
      setUpdate(false);
    }    
  }, [update])

  const synchronize = useCallback((data: any) => {
    socket.emit('synchronize',{
      customer: customerID,
      data: data || {},
      shop: shop ? shop.id : null
    });
  }, [customerID]);
    

  return {
    socket, 
    data, 
    isOnline: online, 
    synchronize,
    toUpdate: updateCounter
  };
};

export {
  useSocket
}