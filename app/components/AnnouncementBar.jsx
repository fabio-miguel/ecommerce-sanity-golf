import {useEffect, useRef, useState} from 'react';

const AnnouncementBar = ({extractedDate}) => {
  const [countDays, setCountDays] = useState(0);
  const [countHours, setCountHours] = useState(0);
  const [countMinutes, setCountMinutes] = useState(0);
  const [countSeconds, setCountSeconds] = useState(0);
  const refAnnouncementText = useRef(null);

  useEffect(() => {
    if (extractedDate) {
      setInterval(function () {
        const countdownDate = new Date(extractedDate.toString()).getTime();
        const countNow = new Date().getTime();
        const countTimeToDate = countdownDate - countNow;
        setCountDays(Math.floor(countTimeToDate / (1000 * 60 * 60 * 24)));
        setCountHours(
          Math.floor(
            (countTimeToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
        );
        setCountMinutes(
          Math.floor((countTimeToDate % (1000 * 60 * 60)) / (1000 * 60)),
        );
        setCountSeconds(Math.floor((countTimeToDate % (1000 * 60)) / 1000));
      }, 1000);
    }
  }, [extractedDate]);

  useEffect(() => {
    countSeconds % 2 == 0
      ? refAnnouncementText.current.style.setProperty('color', 'white')
      : refAnnouncementText.current.style.setProperty('color', 'transparent');
  }, [countSeconds]);

  // console.log(extractedDate);

  return (
    <div className="bg-slate-900 flex w-full px-4 py-4 ">
      <div
        className="flex justify-start w-1/2 text-white m-auto"
        ref={refAnnouncementText}
      >
        Buy three, get 30% off!
      </div>
      <div className="flex justify-end w-1/2 gap-2">
        <div className="text-white text-center">
          <span className="block">{countDays}</span>
          <span className="block">Days</span>
        </div>
        <div className="text-white text-center">
          <span className="block">{countHours}</span>
          <span className="block">Hours</span>
        </div>
        <div className="text-white text-center">
          <span className="block">{countMinutes}</span>
          <span className="block">Minutes</span>
        </div>
        <div className="text-white text-center">
          <span className="block">{countSeconds}</span>
          <span className="block">Seconds</span>
        </div>
      </div>
    </div>
  );
};
export default AnnouncementBar;

// NOTES:
// This component is an anouncement bar used for promotions by clients.
// The expiry time for the promotion is set in Shopify admin > pages > Announcemnet bar (created page)
// The component is placed in layout above the header. In the layout it retrieves the body data, which is the date & time.
// This data is passed into this comp as {extractedDate}
// This component then parses that date and sets it in the announcementBar.
// Therefore, the promo date (extractedDate) is now dynamic and can be adjusted by the client.
