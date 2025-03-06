import React from 'react';

interface LocationDisplayProps {
  location: string | string[];
}

export default function LocationDisplay({ location }: LocationDisplayProps) {
  if (Array.isArray(location)) {
    return <span>{location.join(', ')}</span>;
  }

  // Try to parse if it's a JSON string
  try {
    const parsedLocation = JSON.parse(location);
    if (Array.isArray(parsedLocation)) {
      return <span>{parsedLocation.join(', ')}</span>;
    }
  } catch (e) {
    // Not JSON, continue
  }

  // Regular string
  return <span>{location}</span>;
}
