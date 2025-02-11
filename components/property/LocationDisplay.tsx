const LocationDisplay = ({ location }: { location: string }) => {
    try {
      const locations = JSON.parse(location);
      return <p className="text-[15px] text-muted-foreground">{locations.join(', ')}</p>;
    } catch {
      return <p className="text-base">{location}</p>;
    }
  };

export default LocationDisplay;
