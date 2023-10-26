import { useCallback, useEffect, useMemo, useState } from "react"
import { Socket, io } from "socket.io-client";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

const useSocket = (customer: any) => {
  const fetch = useAuthenticatedFetch();

  const [customerID, setCustomerID] = useState(null);
  const [data, setData] = useState<any[]>(null);
  const [online, setOnline] = useState(false);

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

  useEffect(() => { console.log('shop', shop)}, [shop]);

  const socket = useMemo(() => {
    const socket = io('https://andrii.ngrok.app', {
      path: '/storefront/synchronize'
    });

    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('online', (isOnline) => {
      setOnline(isOnline);
    })

    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    socket.on('synchronize', (data) => {
      setData(data);
    })

    return socket;
  }, []);

  useEffect(() => {
    if (!customer) {
      return;
    }

    console.log(customer);

    const id = Number(
      customer.admin_graphql_api_id.split('/').pop()
    );
      
    if (customerID !== id) {
      setCustomerID(id);
    }
  }, [customer]);

  useEffect(() => {
    if (customerID) {
      socket.emit('session', customerID, null);
    }
  }, [customerID]);

  const synchronize = useCallback((data: any) => {
    socket.emit('synchronize',{
      customer: customerID,
      data: data || {},
      shop: shop ? shop.id : null
    });
  }, [customerID]);
    

  return { socket, data, isOnline: online, synchronize };
};

export {
  useSocket
}