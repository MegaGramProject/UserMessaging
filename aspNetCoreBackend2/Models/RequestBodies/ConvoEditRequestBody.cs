
namespace Megagram.Models.RequestBodies;
public class ConvoEditRequestBody
    {
        public string convoTitle { get; set; }
        public string members { get; set; }
        public string convoInitiator { get; set; }
        public string latestMessage { get; set; }
        public string promotedUsers { get; set; }
        public string isMuted { get; set; }
        public string hasUnreadMessage { get; set; }
        public string isRequested { get; set; }
        public string isDeleted { get; set; }
        public string sessionKeyId { get; set; }
    }
