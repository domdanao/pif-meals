import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  flash: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
}

export function FlashMessageHandler() {
  const { props } = usePage<PageProps>();
  const { toast } = useToast();

  // Debug: Log all props
  console.log('All page props:', props);
  
  useEffect(() => {
    const flash = props.flash;
    
    // Debug: Log flash messages
    console.log('Flash messages received:', flash);
    console.log('Flash keys:', flash ? Object.keys(flash) : 'flash is undefined');
    
    if (flash?.success) {
      console.log('Showing success toast:', flash.success);
      toast({
        variant: 'success',
        title: 'Success',
        description: flash.success,
      });
    }
    
    if (flash?.error) {
      console.log('Showing error toast:', flash.error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: flash.error,
      });
    }
    
    if (flash?.warning) {
      console.log('Showing warning toast:', flash.warning);
      toast({
        variant: 'warning',
        title: 'Warning',
        description: flash.warning,
      });
    }
    
    if (flash?.info) {
      console.log('Showing info toast:', flash.info);
      toast({
        variant: 'info',
        title: 'Info',
        description: flash.info,
      });
    }
  }, [props.flash, toast]);

  return null; // This component doesn't render anything
}
