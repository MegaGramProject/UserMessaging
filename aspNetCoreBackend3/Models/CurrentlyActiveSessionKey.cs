using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
namespace Megagram.Models;

public class CurrentlyActiveSessionKey
{
    [BsonId]
    public ObjectId Id { get; set; }
    public string convoId { get; set; }
    public string sessionKeyId { get; set; }
    public string[][] membersOfConvo { get; set; }

}

