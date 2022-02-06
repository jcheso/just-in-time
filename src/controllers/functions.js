// Function that receives input of two latlong coordinates, and returns distance
export function calculateDistance(origin, destination) {
  // Split origin and destination into latitude and longitude coordinates
  const originArray = origin.split(",");
  const destinationArray = destination.split(",");
  const originLat = originArray[0];
  const originLong = originArray[1];
  const destinationLat = destinationArray[0];
  const destinationLong = destinationArray[1];

  // Determine the straight-line distance between start and end
  const R = 6371e3; // Earth Radius metres
  const φ1 = (originLat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (destinationLat * Math.PI) / 180;
  const Δφ = ((destinationLat - originLat) * Math.PI) / 180;
  const Δλ = ((destinationLong - originLong) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // in metres

  return d;
}
